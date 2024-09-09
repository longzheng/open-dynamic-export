import { meterModel } from '../models/meter.js';
import { SunSpecConnection } from './base.js';

export class MeterSunSpecConnection extends SunSpecConnection {
    async getMeterModel() {
        const modelAddressById = await this.getModelAddressById();

        const address =
            modelAddressById.get(203) ??
            modelAddressById.get(202) ??
            modelAddressById.get(201);

        if (!address) {
            throw new Error('No SunSpec meter model address');
        }

        const data = await meterModel.read({
            modbusConnection: this,
            address,
        });

        return data;
    }
}
