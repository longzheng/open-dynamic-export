import { ModbusConnection } from './base.js';
import {
    GrowattMeter1Model,
    GrowattMeter2Model,
    type GrowattMeterModels,
} from '../models/growatt/meter.js';

export class GrowattConnection extends ModbusConnection {
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
