import type { ControlsModelWrite } from '../models/controls.js';
import { controlsModel } from '../models/controls.js';
import { inverterModel } from '../models/inverter.js';
import type { NameplateModel } from '../models/nameplate.js';
import { nameplateModel } from '../models/nameplate.js';
import type { SettingsModel } from '../models/settings.js';
import { settingsModel } from '../models/settings.js';
import { statusModel } from '../models/status.js';
import { SunSpecConnection } from './base.js';

export class InverterSunSpecConnection extends SunSpecConnection {
    // the nameplate model should never change so we can cache it
    private nameplateModelCache: NameplateModel | null = null;

    // the settings model should never change so we can cache it
    private settingsModelCache: SettingsModel | null = null;

    async getInverterModel() {
        const modelAddressById = await this.getModelAddressById();

        const address =
            modelAddressById.get(103) ??
            modelAddressById.get(102) ??
            modelAddressById.get(101);

        if (!address) {
            throw new Error('No SunSpec inverter model address');
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
        if (this.settingsModelCache) {
            return this.settingsModelCache;
        }

        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(121);

        if (!address) {
            throw new Error('No SunSpec settings model address');
        }

        const data = await settingsModel.read({
            modbusConnection: this,
            address,
        });

        this.settingsModelCache = data;

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
