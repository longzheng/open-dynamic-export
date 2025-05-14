import { meterModelfloat } from '../models/meter.js';
import { SunSpecfloatConnection } from './base.js';

export class MeterSunSpecfloatConnection extends SunSpecfloatConnection {
    async getMeterModel() {
        const modelAddressById = await this.getModelAddressById();

        const address =
            modelAddressById.get(213) ??
            modelAddressById.get(212) ??
            modelAddressById.get(211);

        if (!address) {
            throw new Error('No SunSpec meter model address');
        }

        const data = await meterModelfloat.read({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        return data;
    }
}
