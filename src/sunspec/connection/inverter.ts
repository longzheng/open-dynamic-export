import type { ControlsModelWrite } from '../models/controls';
import { controlsModel } from '../models/controls';
import { inverterModel } from '../models/inverter';
import { nameplateModel } from '../models/nameplate';
import { settingsModel } from '../models/settings';
import { statusModel } from '../models/status';
import { SunSpecConnection } from './base';

export class InverterSunSpecConnection extends SunSpecConnection {
    async getInverterModel() {
        const modelAddressById = await this.getModelAddressById();

        const address =
            modelAddressById.get(103) ??
            modelAddressById.get(102) ??
            modelAddressById.get(101);

        if (!address) {
            throw new Error('No SunSpec inverter monitoring model address');
        }

        const data = await inverterModel.read({
            modbusConnection: this,
            address,
        });

        if (data.ID !== 101 && data.ID !== 102 && data.ID !== 103) {
            throw new Error('Not a SunSpec inverter monitoring model');
        }

        return data;
    }

    async getNameplateModel() {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(120);

        if (!address) {
            throw new Error('No SunSpec nameplate model address');
        }

        const data = await nameplateModel.read({
            modbusConnection: this,
            address,
        });

        if (data.ID !== 120) {
            throw new Error('Not a SunSpec nameplate model');
        }

        return data;
    }

    async getSettingsModel() {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(121);

        if (!address) {
            throw new Error('No SunSpec settings model address');
        }

        const data = await settingsModel.read({
            modbusConnection: this,
            address,
        });

        if (data.ID !== 121) {
            throw new Error('Not a SunSpec settings model');
        }

        return data;
    }

    async getStatusModel() {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(122);

        if (!address) {
            throw new Error('No SunSpec status model address');
        }

        const data = await statusModel.read({
            modbusConnection: this,
            address,
        });

        if (data.ID !== 122) {
            throw new Error('Not a SunSpec status model');
        }

        return data;
    }

    async getControlsModel() {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(123);

        if (!address) {
            throw new Error('No SunSpec controls model address');
        }

        const data = await controlsModel.read({
            modbusConnection: this,
            address,
        });

        if (data.ID !== 123) {
            throw new Error('Not a SunSpec controls model');
        }

        return data;
    }

    async writeControlsModel(values: ControlsModelWrite) {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(123);

        if (!address) {
            throw new Error('No SunSpec controls model address');
        }

        return await controlsModel.write({
            modbusConnection: this,
            address,
            values,
        });
    }
}
