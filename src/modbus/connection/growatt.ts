import type { ModbusConnection } from './base.js';
import {
    GrowattMeter1Model,
    GrowattMeter2Model,
    type GrowattMeterModels,
} from '../models/growatt/meter.js';
import {
    GrowattInveter1Model,
    type GrowattInverterModels,
} from '../models/growatt/inveter.js';
import { getModbusConnection } from '../connections.js';
import type { ModbusSchema } from '../../helpers/config.js';
import type { Logger } from 'pino';

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

    public onDestroy(): void {
        this.modbusConnection.close();
    }
}
