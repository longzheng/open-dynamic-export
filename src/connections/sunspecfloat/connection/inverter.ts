import { differenceInSeconds } from 'date-fns';
import {
    type ControlsModel,
    type ControlsModelWrite,
} from '../../sunspec/models/controls.js';
import { controlsModel } from '../../sunspec/models/controls.js';
import { inverterModelfloat } from '../models/inverter.js';
import { type NameplateModel } from '../../sunspec/models/nameplate.js';
import { nameplateModel } from '../../sunspec/models/nameplate.js';
import { type SettingsModel } from '../../sunspec/models/settings.js';
import { settingsModel } from '../../sunspec/models/settings.js';
import { type StatusModel } from '../../sunspec/models/status.js';
import { statusModel } from '../../sunspec/models/status.js';
import {
    type StorageModel,
    type StorageModelWrite,
} from '../../sunspec/models/storage.js';
import { storageModel } from '../../sunspec/models/storage.js';
import { SunSpecfloatConnection } from './base.js';
import {
    mpptModuleModel,
    type MpptModuleModel,
} from '../../sunspec/models/mppt.js';
import { mpptModel } from '../../sunspec/models/mppt.js';

export class InverterSunSpecfloatConnection extends SunSpecfloatConnection {
    // the nameplate model should never change so we can cache it
    private nameplateModelCache: NameplateModel | null = null;

    // the settings model should never change so we can cache it
    private settingsModelCache: SettingsModel | null = null;

    // the status model should not regularly change so we can cache it for a short while
    // practically we only need the value when the inverter connection state changes which does not happen often
    private statusModelCache: { cache: StatusModel; date: Date } | null = null;

    // this software expects to solely control the inverter
    // cache the controls model once permanently to avoid unnecessary reads
    // note: if any other software also writes to the controls model for properties we don't care about, we will overwrite them
    private controlsModelCache: ControlsModel | null = null;

    // this software expects to solely control the inverter
    // cache the storage model once permanently to avoid unnecessary reads
    // note: if any other software also writes to the storage model for properties we don't care about, we will overwrite them
    private storageModelCache: StorageModel | null = null;

    async getInverterModel() {
        const modelAddressById = await this.getModelAddressById();

        const address =
            modelAddressById.get(113) ??
            modelAddressById.get(112) ??
            modelAddressById.get(111);

        if (!address) {
            throw new Error('No SunSpec inverter model address');
        }

        const data = await inverterModelfloat.read({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
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
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
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
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        this.settingsModelCache = data;

        return data;
    }

    async getStatusModel() {
        if (
            this.statusModelCache &&
            // cache valid for 5 seconds
            differenceInSeconds(new Date(), this.statusModelCache.date) < 5
        ) {
            return this.statusModelCache.cache;
        }

        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(122);

        if (!address) {
            throw new Error('No SunSpec status model address');
        }

        const data = await statusModel.read({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        this.statusModelCache = {
            cache: data,
            date: new Date(),
        };

        return data;
    }

    async getControlsModel() {
        if (this.controlsModelCache) {
            return this.controlsModelCache;
        }

        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(123);

        if (!address) {
            throw new Error('No SunSpec controls model address');
        }

        const data = await controlsModel.read({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        this.controlsModelCache = data;

        return data;
    }

    async writeControlsModel(values: ControlsModelWrite) {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(123);

        if (!address) {
            throw new Error('No SunSpec controls model address');
        }

        return await controlsModel.write({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
            values,
        });
    }

    async getMpptModel() {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(160);

        if (!address) {
            throw new Error('No SunSpec mppt model address');
        }

        const data = await mpptModel.read({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        const modulesData: MpptModuleModel[] = [];

        if (data.N) {
            for (let i = 0; i < data.N; i++) {
                const moduleData = await mpptModuleModel.read({
                    modbusConnection: this.modbusConnection,
                    address: {
                        start: address.start + 10 + i * 20,
                        length: 20,
                    },
                    unitId: this.unitId,
                });
                modulesData.push(moduleData);
            }
        }

        return {
            ...data,
            modules: modulesData,
        };
    }

    async getStorageModel() {
        if (this.storageModelCache) {
            return this.storageModelCache;
        }

        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(124);

        if (!address) {
            throw new Error('No SunSpec storage model address');
        }

        const data = await storageModel.read({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        this.storageModelCache = data;

        return data;
    }

    async writeStorageModel(values: StorageModelWrite) {
        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(124);

        if (!address) {
            throw new Error('No SunSpec storage model address');
        }

        return await storageModel.write({
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
            values,
        });
    }
}
