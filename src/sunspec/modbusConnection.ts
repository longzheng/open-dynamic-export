import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import { commonModel } from './models/common';
import {
    inverterModel,
    inverterModelAddressStartByBrand,
} from './models/inverter';
import type { SunSpecBrand } from './brand';
import {
    nameplateModel,
    nameplateModelAddressStartByBrand,
} from './models/nameplate';
import {
    settingsModel,
    settingsModelAddressStartByBrand,
} from './models/settings';
import { statusModel, statusModelAddressStartByBrand } from './models/status';
import type { ControlsModelWrite } from './models/controls';
import {
    controlsModel,
    controlsModelAddressStartByBrand,
} from './models/controls';
import { meterModel, meterModelAddressStartByBrand } from './models/meter';

export class ModbusConnection {
    public client: ModbusRTU;
    private ip: string;
    private port: number;
    private unitId: number;
    private openPromise: Promise<boolean> | null = null;

    constructor({
        ip,
        port,
        unitId,
    }: {
        ip: string;
        port: number;
        unitId: number;
    }) {
        this.client = new ModbusRTU();
        this.ip = ip;
        this.port = port;
        this.unitId = unitId;

        this.client.on('close', () => {
            console.error('Modbus client closed');
        });

        this.client.on('error', (err) => {
            console.error('Modbus client error:', err);
        });

        void this.connect();
    }

    private async connect() {
        if (this.client.isOpen) {
            return;
        }

        try {
            await this.client.connectTCP(this.ip, { port: this.port });
            this.client.setID(this.unitId);
            this.client.setTimeout(1000);
            console.log('Modbus client connected');
        } catch (error) {
            console.error('Error connecting to Modbus:', error);
        }
    }

    private openAsync() {
        if (this.client.isOpen) {
            return Promise.resolve(true);
        }

        if (this.openPromise) {
            return this.openPromise;
        }

        const openPromise = new Promise<boolean>((resolve) => {
            this.client.open(() => {
                this.openPromise = null;

                resolve(this.client.isOpen);
            });
        });

        this.openPromise = openPromise;

        return openPromise;
    }

    public async waitUntilOpen() {
        while (!this.client.isOpen) {
            await this.openAsync();
            await scheduler.wait(1000);
        }
    }

    async getCommonModel() {
        const data = await commonModel.read({
            modbusConnection: this,
            addressStart: 40000,
        });

        // SID is a well-known value. Uniquely identifies this as a SunSpec Modbus Map
        // assert this is the case or this isn't SunSpec
        // 0x53756e53 ('SunS')
        if (data.SID !== 0x53756e53) {
            throw new Error('Not a SunSpec device');
        }

        if (data.ID !== 1) {
            throw new Error('Not a SunSpec common model');
        }

        return data;
    }

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

    async getMeterModel(brand: SunSpecBrand) {
        const data = await meterModel.read({
            modbusConnection: this,
            addressStart: meterModelAddressStartByBrand(brand),
        });

        if (data.ID !== 201 && data.ID !== 202 && data.ID !== 203) {
            throw new Error('Not a SunSpec meter model');
        }

        return data;
    }
}
