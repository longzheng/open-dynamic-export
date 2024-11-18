import { type z } from 'zod';
import { type Config } from '../../helpers/config.js';
import { getPowerwall2Client } from '../../connections/powerwall2/getClient.js';
import { type Powerwall2Client } from '../../connections/powerwall2/client.js';
import {
    type meterAggregatesSchema,
    type systemStatusSchema,
    type systemStatusSoeSchema,
} from '../../connections/powerwall2/api.js';
import { StorageDataPollerBase } from '../storageDataPollerBase.js';
import { type StorageData } from '../storageData.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { StorageModeStatusValue } from '../../sep2/models/storageModeStatus.js';

export class Powerwall2StorageDataPoller extends StorageDataPollerBase {
    private client: Powerwall2Client;

    constructor({
        storageIndex,
        powerwall2Config,
    }: {
        storageIndex: number;
        powerwall2Config: Extract<
            NonNullable<Config['storage']>[number],
            { type: 'powerwall2' }
        >;
    }) {
        super({
            name: 'Powerwall2StorageDataPoller',
            storageIndex,
            // powerwall2 can't be manually controlled
            applyControl: false,
            pollingIntervalMs: 200,
        });

        this.client = getPowerwall2Client({
            ip: powerwall2Config.ip,
            password: powerwall2Config.password,
            timeoutSeconds: powerwall2Config.timeoutSeconds,
        });

        void this.startPolling();
    }

    override async getStorageData(): Promise<StorageData> {
        const start = performance.now();

        const meterAggregates = await this.client.getMeterAggregates();
        const systemStatus = await this.client.getSystemStatus();
        const soe = await this.client.getSoe();

        const end = performance.now();
        const duration = end - start;

        const data: Data = {
            meterAggregates,
            systemStatus,
            soe,
        };

        this.logger.trace({ duration, data }, 'polled Powerwall storage data');

        const storageData = generateStorageData(data);

        return storageData;
    }

    override onControl(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    override onDestroy() {}
}

type Data = {
    meterAggregates: z.infer<typeof meterAggregatesSchema>;
    systemStatus: z.infer<typeof systemStatusSchema>;
    soe: z.infer<typeof systemStatusSoeSchema>;
};

export function generateStorageData({
    meterAggregates,
    systemStatus,
    soe,
}: Data): StorageData {
    return {
        date: new Date(),
        socRatio: soe.percentage / 100,
        inverter: {
            realPower: meterAggregates.battery.instant_power,
            reactivePower: meterAggregates.battery.instant_reactive_power,
            voltagePhaseA: null,
            voltagePhaseB: null,
            voltagePhaseC: null,
            frequency: meterAggregates.battery.frequency,
        },
        nameplate: {
            maxWh: systemStatus.nominal_full_pack_energy,
            maxW: systemStatus.max_discharge_power,
            maxVA: systemStatus.max_apparent_power,
            maxVar: systemStatus.max_discharge_power,
        },
        settings: {
            maxW: systemStatus.max_discharge_power,
            maxVA: systemStatus.max_apparent_power,
            maxVar: systemStatus.max_discharge_power,
        },
        status: {
            connectStatus:
                ConnectStatusValue.Connected |
                ConnectStatusValue.Available |
                ConnectStatusValue.Operating,
            modeStatus: ((): StorageModeStatusValue => {
                if (systemStatus.battery_target_power === 0) {
                    return StorageModeStatusValue.StorageHolding;
                } else if (systemStatus.battery_target_power > 0) {
                    return StorageModeStatusValue.StorageCharging;
                } else {
                    return StorageModeStatusValue.StorageDischarging;
                }
            })(),
        },
    };
}
