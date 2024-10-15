import { ModbusConnection } from './base.js';
import {
    smaCore1MeterModel1,
    smaCore1MeterModel2,
} from '../models/smaCore1Meter.js';

export class SmaConnection extends ModbusConnection {
    async getMeterModel() {
        const data1 = await smaCore1MeterModel1.read({
            modbusConnection: this,
            address: {
                start: 31253,
                length: 26,
            },
        });

        const data2 = await smaCore1MeterModel2.read({
            modbusConnection: this,
            address: {
                start: 31433,
                length: 24,
            },
        });

        return { ...data1, ...data2 };
    }
}
