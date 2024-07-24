import type { SunSpecBrand } from '../brand';
import type { ControlsModelWrite } from '../models/controls';
import {
    controlsModel,
    controlsModelAddressStartByBrand,
} from '../models/controls';
import {
    inverterModel,
    inverterModelAddressStartByBrand,
} from '../models/inverter';
import {
    nameplateModel,
    nameplateModelAddressStartByBrand,
} from '../models/nameplate';
import {
    settingsModel,
    settingsModelAddressStartByBrand,
} from '../models/settings';
import { statusModel, statusModelAddressStartByBrand } from '../models/status';
import { SunSpecConnection } from './base';

export class InverterSunSpecConnection extends SunSpecConnection {
    async getInverterModel(brand: SunSpecBrand) {
        const data = await inverterModel.read({
            modbusConnection: this,
            addressStart: inverterModelAddressStartByBrand(brand),
        });

        if (data.ID !== 101 && data.ID !== 102 && data.ID !== 103) {
            throw new Error('Not a SunSpec inverter monitoring model');
        }

        return data;
    }

    async getNameplateModel(brand: SunSpecBrand) {
        const data = await nameplateModel.read({
            modbusConnection: this,
            addressStart: nameplateModelAddressStartByBrand(brand),
        });

        if (data.ID !== 120) {
            throw new Error('Not a SunSpec nameplate model');
        }

        return data;
    }

    async getSettingsModel(brand: SunSpecBrand) {
        const data = await settingsModel.read({
            modbusConnection: this,
            addressStart: settingsModelAddressStartByBrand(brand),
        });

        if (data.ID !== 121) {
            throw new Error('Not a SunSpec settings model');
        }

        return data;
    }

    async getStatusModel(brand: SunSpecBrand) {
        const data = await statusModel.read({
            modbusConnection: this,
            addressStart: statusModelAddressStartByBrand(brand),
        });

        if (data.ID !== 122) {
            throw new Error('Not a SunSpec status model');
        }

        return data;
    }

    async getControlsModel(brand: SunSpecBrand) {
        const data = await controlsModel.read({
            modbusConnection: this,
            addressStart: controlsModelAddressStartByBrand(brand),
        });

        if (data.ID !== 123) {
            throw new Error('Not a SunSpec controls model');
        }

        return data;
    }

    async writeControlsModel(brand: SunSpecBrand, values: ControlsModelWrite) {
        return await controlsModel.write({
            modbusConnection: this,
            addressStart: controlsModelAddressStartByBrand(brand),
            values,
        });
    }
}
