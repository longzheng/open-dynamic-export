import { getBrandByCommonModel } from '../brand';
import { meterModel, meterModelAddressStartByBrand } from '../models/meter';
import { SunSpecConnection } from './base';

export class MeterSunSpecConnection extends SunSpecConnection {
    async getMeterModel() {
        const data = await meterModel.read({
            modbusConnection: this,
            addressStart: (commonModel) =>
                meterModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
        });

        if (data.ID !== 201 && data.ID !== 202 && data.ID !== 203) {
            throw new Error('Not a SunSpec meter model');
        }

        return data;
    }
}
