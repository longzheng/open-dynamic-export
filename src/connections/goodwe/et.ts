import { type ModbusConnection } from '../modbus/connection/base.js';
import { type Logger } from 'pino';
import { getModbusConnection } from '../modbus/connections.js';
import { type ModbusSchema } from '../../helpers/config.js';
import {
    GoodweEtDeviceParametersModel,
    type GoodweEtDeviceParameters,
} from './models/et/deviceParameters.js';
import { type GoodweEtInverterRunningData1 } from './models/et/inverterRunningData1.js';
import { GoodweEtInverterRunningData1Model } from './models/et/inverterRunningData1.js';
import {
    GoodweEtMeterDataModel,
    type GoodweEtMeterData,
} from './models/et/meterData.js';
import { writeLatency } from '../../helpers/influxdb.js';
import {
    type GoodweEtMeterControlWrite,
    GoodweGoodweEtMeterControlModel,
    type GoodweEtMeterControl,
} from './models/et/meterControl.js';

export class GoodweEtConnection {
    protected readonly modbusConnection: ModbusConnection;
    protected readonly unitId: number;
    private logger: Logger;

    // the device parameters model should never change so we can cache it
    private deviceParameters: GoodweEtDeviceParameters | null = null;

    constructor({ connection, unitId }: ModbusSchema) {
        this.modbusConnection = getModbusConnection(connection);
        this.unitId = unitId;
        this.logger = this.modbusConnection.logger.child({
            module: 'GoodweConnection',
            unitId,
        });
    }

    async getDeviceParameters(): Promise<GoodweEtDeviceParameters> {
        if (this.deviceParameters) {
            return this.deviceParameters;
        }

        const data = await GoodweEtDeviceParametersModel.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 35001,
                length: 15,
            },
            unitId: this.unitId,
        });

        this.deviceParameters = data;

        return data;
    }

    async getInverterRunningData1(): Promise<GoodweEtInverterRunningData1> {
        const data = await GoodweEtInverterRunningData1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 35121,
                length: 24,
            },
            unitId: this.unitId,
        });

        return data;
    }

    async getMeterData(): Promise<GoodweEtMeterData> {
        const start = performance.now();

        const data = await GoodweEtMeterDataModel.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 36003,
                length: 55,
            },
            unitId: this.unitId,
        });

        writeLatency({
            field: 'GoodweEtConnection',
            duration: performance.now() - start,
            tags: {
                model: 'GoodweEtMeterDataModel',
            },
        });

        return data;
    }

    async getMeterControl(): Promise<GoodweEtMeterControl> {
        const data = await GoodweGoodweEtMeterControlModel.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 47509,
                length: 2,
            },
            unitId: this.unitId,
        });

        return data;
    }

    async setMeterControl(values: GoodweEtMeterControlWrite): Promise<void> {
        await GoodweGoodweEtMeterControlModel.write({
            modbusConnection: this.modbusConnection,
            address: {
                start: 47509,
                length: 2,
            },
            unitId: this.unitId,
            values,
        });
    }

    public onDestroy(): void {
        this.modbusConnection.close();
    }
}
