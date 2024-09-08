import type { ControlsModelWrite } from '../models/controls';
import { controlsModel } from '../models/controls';
import { inverterModel } from '../models/inverter';
import type { NameplateModel } from '../models/nameplate';
import { nameplateModel } from '../models/nameplate';
import { settingsModel } from '../models/settings';
import { statusModel } from '../models/status';
import { SunSpecConnection } from './base';

export class InverterSunSpecConnection extends SunSpecConnection {
    // the nameplate model should never change so we can cache it
    private nameplateModelCache: NameplateModel | null = null;

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

        return data;
    }

    async getNameplateModel() {
        if (this.nameplateModelCache) {
            return this.nameplateModelCache;
        }

        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(120);

        if (!address) {
            throw new Error('No SunSpec nameplate model address');
        }

        const data = await nameplateModel.read({
            modbusConnection: this,
            address,
        });

        this.nameplateModelCache = data;

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
