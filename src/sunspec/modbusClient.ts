import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import { commonBlock } from './models/commonBlock';
import { getInverterBlockByBrand } from './models/inverterBlock';
import type { SunSpecBrand } from './models/brand';

export class ModbusClient {
    public client: ModbusRTU;
    private host: string;
    private port: number;
    private unitId: number;
    private openPromise: Promise<boolean> | null = null;
    // private getCommonBlock:

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

    async getCommonBlock() {
        const data = await commonBlock.get(this);

        // SID is a well-known value. Uniquely identifies this as a SunSpec Modbus Map
        // assert this is the case or this isn't SunSpec
        // 0x53756e53 ('SunS')
        if (data.C_SunSpec_ID !== 0x53756e53) {
            throw new Error('Not a SunSpec device');
        }

        return data;
    }

    async getInverterBlock(brand: SunSpecBrand) {
        const data = await getInverterBlockByBrand(brand).get(this);

        return data;
    }
}
