import { getBrandByCommonModel } from '../brand';
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
    async getInverterModel() {
        const data = await inverterModel.read({
            modbusConnection: this,
            addressStart: (commonModel) =>
                inverterModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
        });

        if (data.ID !== 101 && data.ID !== 102 && data.ID !== 103) {
            throw new Error('Not a SunSpec inverter monitoring model');
        }

        return data;
    }

    async getNameplateModel() {
        const data = await nameplateModel.read({
            modbusConnection: this,
            addressStart: (commonModel) =>
                nameplateModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
        });

        if (data.ID !== 120) {
            throw new Error('Not a SunSpec nameplate model');
        }

        return data;
    }

    async getSettingsModel() {
        const data = await settingsModel.read({
            modbusConnection: this,
            addressStart: (commonModel) =>
                settingsModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
        });

        if (data.ID !== 121) {
            throw new Error('Not a SunSpec settings model');
        }

        return data;
    }

    async getStatusModel() {
        const data = await statusModel.read({
            modbusConnection: this,
            addressStart: (commonModel) =>
                statusModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
        });

        if (data.ID !== 122) {
            throw new Error('Not a SunSpec status model');
        }

        return data;
    }

    async getControlsModel() {
        const data = await controlsModel.read({
            modbusConnection: this,
            addressStart: (commonModel) =>
                controlsModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
        });

        if (data.ID !== 123) {
            throw new Error('Not a SunSpec controls model');
        }

        return data;
    }

    async writeControlsModel(values: ControlsModelWrite) {
        return await controlsModel.write({
            modbusConnection: this,
            addressStart: (commonModel) =>
                controlsModelAddressStartByBrand(
                    getBrandByCommonModel(commonModel),
                ),
            values,
        });
    }
}
