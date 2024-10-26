import { ModbusConnection } from './base.js';
import {
    GrowattMeter1Model,
    GrowattMeter2Model,
    type GrowattMeterModels,
} from '../models/growatt/meter.js';
import {
    GrowattInveter1Model,
    type GrowattInverterModels,
} from '../models/growatt/inveter.js';

export class GrowattConnection extends ModbusConnection {
    async getInverterModel(): Promise<GrowattInverterModels> {
        const model1 = await GrowattInveter1Model.read({
            modbusConnection: this,
            address: {
                start: 0,
                length: 3,
            },
        });

        return model1;
    }

    async getMeterModel(): Promise<GrowattMeterModels> {
        const model1 = await GrowattMeter1Model.read({
            modbusConnection: this,
            address: {
                start: 37,
                length: 10,
            },
        });

        const model2 = await GrowattMeter2Model.read({
            modbusConnection: this,
            address: {
                start: 1015,
                length: 24,
            },
        });

        const data = { ...model1, ...model2 };

        return data;
    }
}
