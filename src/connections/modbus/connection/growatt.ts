import { type ModbusSchema } from '../../../helpers/config.js';
import { getModbusConnection } from '../connections.js';
import { type GrowattInverterModels } from '../models/growatt/inverter.js';
import { GrowattInveter1Model } from '../models/growatt/inverter.js';
import { type GrowattInverterControl } from '../models/growatt/inverterControl.js';
import { GrowattInverterControl1Model } from '../models/growatt/inverterControl.js';
import { type GrowattMeterModels } from '../models/growatt/meter.js';
import {
    GrowattMeter1Model,
    GrowattMeter2Model,
} from '../models/growatt/meter.js';
import { type ModbusConnection } from './base.js';
import { type Logger } from 'pino';

export class GrowattConnection {
    protected readonly modbusConnection: ModbusConnection;
    protected readonly unitId: number;
    private logger: Logger;

    constructor({ connection, unitId }: ModbusSchema) {
        this.modbusConnection = getModbusConnection(connection);
        this.unitId = unitId;
        this.logger = this.modbusConnection.logger.child({
            module: 'GrowattConnection',
            unitId,
        });
    }

    async getInverterModel(): Promise<GrowattInverterModels> {
        const model1 = await GrowattInveter1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 0,
                length: 3,
            },
            unitId: this.unitId,
        });

        return model1;
    }

    async getMeterModel(): Promise<GrowattMeterModels> {
        const model1 = await GrowattMeter1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 37,
                length: 10,
            },
            unitId: this.unitId,
        });

        const model2 = await GrowattMeter2Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 1015,
                length: 24,
            },
            unitId: this.unitId,
        });

        const data = { ...model1, ...model2 };

        return data;
    }

    async writeInverterControlModel(values: GrowattInverterControl) {
        return await GrowattInverterControl1Model.write({
            modbusConnection: this.modbusConnection,
            address: {
                start: 3,
                length: 1,
            },
            unitId: this.unitId,
            values,
        });
    }

    public onDestroy(): void {
        this.modbusConnection.close();
    }
}
