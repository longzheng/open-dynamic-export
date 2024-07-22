import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import { commonModel } from './models/commonModel';
import {
    inverterModel,
    inverterModelAddressStartByBrand,
} from './models/inverterModel';
import type { SunSpecBrand } from './models/brand';
import {
    nameplateModel,
    nameplateModelAddressStartByBrand,
} from './models/nameplateModel';

export class ModbusClient {
    public client: ModbusRTU;
    private host: string;
    private port: number;
    private unitId: number;
    private openPromise: Promise<boolean> | null = null;

    constructor(host: string, port: number, unitId: number) {
        this.client = new ModbusRTU();
        this.host = host;
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
            await this.client.connectTCP(this.host, { port: this.port });
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
        const data = await commonModel.get({
            client: this,
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
        const data = await inverterModel.get({
            client: this,
            addressStart: inverterModelAddressStartByBrand(brand),
        });

        if (data.ID !== 101 && data.ID !== 102 && data.ID !== 103) {
            throw new Error('Not a SunSpec inverter monitoring model');
        }

        return data;
    }

    async getNameplateModel(brand: SunSpecBrand) {
        const data = await nameplateModel.get({
            client: this,
            addressStart: nameplateModelAddressStartByBrand(brand),
        });

        if (data.ID !== 120) {
            throw new Error('Not a SunSpec nameplate model');
        }

        return data;
    }
}
