import { meterModel } from '../models/meter';
import { SunSpecConnection } from './base';

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

        if (data.ID !== 201 && data.ID !== 202 && data.ID !== 203) {
            throw new Error('Not a SunSpec meter model');
        }

        return data;
    }
}
