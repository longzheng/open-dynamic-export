import { type InverterData } from '../inverterData.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import { type InverterConfiguration } from '../../coordinator/helpers/inverterController.js';
import { type Config } from '../../helpers/config.js';
import { writeLatency } from '../../helpers/influxdb.js';
import { averageNumbersNullableArray } from '../../helpers/number.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';
import { GoodweEtConnection } from '../../connections/goodwe/et.js';
import { type GoodweEtDeviceParameters } from '../../connections/goodwe/models/et/deviceParameters.js';
import {
    GridMode,
    type GoodweEtInverterRunningData1,
} from '../../connections/goodwe/models/et/inverterRunningData1.js';

export class GoodweEtInverterDataPoller extends InverterDataPollerBase {
    private connection: GoodweEtConnection;

    constructor({
        goodweEtInverterConfig,
        inverterIndex,
        applyControl,
    }: {
        goodweEtInverterConfig: Extract<
            Config['inverters'][number],
            { type: 'goodwe'; model: 'et' }
        >;
        inverterIndex: number;
        applyControl: boolean;
    }) {
        super({
            name: 'GoodweEtInverterDataPoller',
            pollingIntervalMs: 200,
            applyControl,
            inverterIndex,
        });

        this.connection = new GoodweEtConnection(goodweEtInverterConfig);

        void this.startPolling();
    }

    override async getInverterData(): Promise<InverterData> {
        const start = performance.now();

        const deviceParameters = await this.connection.getDeviceParameters();

        writeLatency({
            field: 'GoodweEtInverterDataPoller',
            duration: performance.now() - start,
            tags: {
                inverterIndex: this.inverterIndex.toString(),
                model: 'deviceParameters',
            },
        });

        const inverterRunningData1 =
            await this.connection.getInverterRunningData1();

        writeLatency({
            field: 'GoodweEtInverterDataPoller',
            duration: performance.now() - start,
            tags: {
                inverterIndex: this.inverterIndex.toString(),
                model: 'inverterRunningData1',
            },
        });

        const models: InverterModels = {
            deviceParameters,
            inverterRunningData1,
        };

        const end = performance.now();
        const duration = end - start;

        this.logger.trace({ duration, models }, 'Got inverter data');

        const inverterData = generateInverterData(models);

        return inverterData;
    }

    override onDestroy(): void {
        this.connection.onDestroy();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async onControl(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _inverterConfiguration: InverterConfiguration,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

type InverterModels = {
    deviceParameters: GoodweEtDeviceParameters;
    inverterRunningData1: GoodweEtInverterRunningData1;
};

export function generateInverterData({
    deviceParameters,
    inverterRunningData1,
}: InverterModels): InverterData {
    return {
        date: new Date(),
        inverter: {
            realPower: inverterRunningData1.ACActivePower,
            reactivePower: inverterRunningData1.ACReactivePower,
            voltagePhaseA: inverterRunningData1.Vgrid_R,
            voltagePhaseB: inverterRunningData1.Vgrid_S,
            voltagePhaseC: inverterRunningData1.Vgrid_T,
            frequency: averageNumbersNullableArray([
                inverterRunningData1.Fgrid_R || null,
                inverterRunningData1.Fgrid_S || null,
                inverterRunningData1.Fgrid_T || null,
            ])!,
        },
        nameplate: {
            type: DERTyp.PV_STOR,
            maxW: deviceParameters.RatePower,
            maxVA: deviceParameters.RatePower,
            maxVar: deviceParameters.RatePower,
        },
        settings: {
            maxW: deviceParameters.RatePower,
            maxVA: deviceParameters.RatePower,
            maxVar: deviceParameters.RatePower,
        },
        status: generateInverterDataStatus({ inverterRunningData1 }),
    };
}

export function generateInverterDataStatus({
    inverterRunningData1,
}: {
    inverterRunningData1: GoodweEtInverterRunningData1;
}): InverterData['status'] {
    return {
        operationalModeStatus:
            inverterRunningData1.GridMode === GridMode.OK
                ? OperationalModeStatusValue.OperationalMode
                : OperationalModeStatusValue.Off,
        genConnectStatus: (() => {
            switch (inverterRunningData1.GridMode) {
                case GridMode.OK:
                    return (
                        ConnectStatusValue.Connected |
                        ConnectStatusValue.Available |
                        ConnectStatusValue.Operating
                    );
                case GridMode.Loss:
                    return 0 as ConnectStatusValue;
                case GridMode.Fault:
                    return ConnectStatusValue.Fault;
            }
        })(),
    };
}
