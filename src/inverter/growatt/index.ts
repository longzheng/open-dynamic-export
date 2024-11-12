import { type InverterData } from '../inverterData.js';
import { type Result } from '../../helpers/result.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import { type InverterConfiguration } from '../../coordinator/helpers/inverterController.js';
import { type Config } from '../../helpers/config.js';
import { withRetry } from '../../helpers/withRetry.js';
import { writeLatency } from '../../helpers/influxdb.js';
import { type GrowattInverterModels } from '../../connections/modbus/models/growatt/inverter.js';
import { GrowattConnection } from '../../connections/modbus/connection/growatt.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';

export class GrowattInverterDataPoller extends InverterDataPollerBase {
    private growattConnection: GrowattConnection;

    constructor({
        growattInverterConfig,
        inverterIndex,
        applyControl,
    }: {
        growattInverterConfig: Extract<
            Config['inverters'][number],
            { type: 'growatt' }
        >;
        inverterIndex: number;
        applyControl: boolean;
    }) {
        super({
            name: 'GrowattInverterDataPoller',
            pollingIntervalMs: 200,
            applyControl,
            inverterIndex,
        });

        this.growattConnection = new GrowattConnection(growattInverterConfig);

        void this.startPolling();
    }

    override async getInverterData(): Promise<Result<InverterData>> {
        try {
            return await withRetry(
                async () => {
                    const start = performance.now();

                    const inverterModel =
                        await this.growattConnection.getInverterModel();

                    writeLatency({
                        field: 'GrowattInverterDataPoller',
                        duration: performance.now() - start,
                        tags: {
                            inverterIndex: this.inverterIndex.toString(),
                            model: 'inverter',
                        },
                    });

                    const models: InverterModels = {
                        inverter: inverterModel,
                    };

                    const end = performance.now();
                    const duration = end - start;

                    this.logger.trace(
                        { duration, models },
                        'Got inverter data',
                    );

                    const inverterData = generateInverterData(models);

                    return {
                        success: true,
                        value: inverterData,
                    };
                },
                {
                    attempts: 3,
                    delayMilliseconds: 100,
                    functionName: 'get inverter data',
                },
            );
        } catch (error) {
            this.logger.error(error, 'Failed to get inverter data');

            return {
                success: false,
                error: new Error(
                    `Error loading inverter data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                ),
            };
        }
    }

    override onDestroy(): void {
        this.growattConnection.onDestroy();
    }

    override async onControl(
        inverterConfiguration: InverterConfiguration,
    ): Promise<void> {
        const targetPowerRatio = (() => {
            switch (inverterConfiguration.type) {
                case 'disconnect':
                    return 0;
                case 'limit':
                    return (
                        (inverterConfiguration.targetSolarWatts /
                            inverterConfiguration.invertersCount -
                            250) /
                        6000
                    );
            }
        })();

        // clamp between 0 and 100
        // no decimal points, round down
        const ActivePRate = Math.max(
            Math.min(Math.floor(targetPowerRatio * 100), 100),
            0,
        );

        await this.growattConnection.writeInverterControlModel({
            ActivePRate,
        });
    }
}

type InverterModels = {
    inverter: GrowattInverterModels;
};

export function generateInverterData({
    inverter,
}: InverterModels): InverterData {
    return {
        date: new Date(),
        inverter: {
            realPower: inverter.Ppv,
            reactivePower: 0,
            voltagePhaseA: 0,
            voltagePhaseB: null,
            voltagePhaseC: null,
            frequency: 0,
        },
        nameplate: {
            type: DERTyp.PV,
            maxW: 0,
            maxVA: 0,
            maxVar: 0,
        },
        settings: {
            maxW: 0,
            maxVA: 0,
            maxVar: 0,
        },
        status: generateInverterDataStatus(),
    };
}

export function generateInverterDataStatus(): InverterData['status'] {
    return {
        operationalModeStatus: OperationalModeStatusValue.OperationalMode,
        genConnectStatus:
            ConnectStatusValue.Available |
            ConnectStatusValue.Connected |
            ConnectStatusValue.Operating,
    };
}
