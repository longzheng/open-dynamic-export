import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import { parseCommonBlock } from './models/commonBlock';

export class ModbusClient {
    private client: ModbusRTU;
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

    private async waitUntilOpen() {
        while (!this.client.isOpen) {
            await this.openAsync();
            await scheduler.wait(1000);
        }
    }

    async getCommonBlock() {
        await this.waitUntilOpen();

        const result = await this.client.readHoldingRegisters(40000, 69);

        return parseCommonBlock(result.data);
    }
}
