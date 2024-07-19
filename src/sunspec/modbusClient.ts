import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import {
    registersToString,
    registersToUint16,
    registersToUint32,
} from './registers';

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

        const SID = registersToUint32(result.data.slice(0, 2));

        // SID is a well-known value. Uniquely identifies this as a SunSpec Modbus Map
        // assert this is the case or this isn't SunSpec
        // 0x53756e53 ('SunS')
        if (SID !== 0x53756e53) {
            throw new Error('Not a SunSpec device');
        }

        return {
            // Well-known value. Uniquely identifies this as a SunSpec Modbus Map
            SID,
            // Length of sunspec model common (1)
            ID: registersToUint16(result.data.slice(2, 3)),
            // Length of sunspec model common (1)
            L: registersToUint16(result.data.slice(3, 4)),
            // Manufacturer
            Mn: registersToString(result.data.slice(4, 20)),
            // Device model
            Md: registersToString(result.data.slice(20, 36)),
            // Options
            Opt: registersToString(result.data.slice(36, 44)),
            // SW version of inverter
            Vr: registersToString(result.data.slice(44, 52)),
            // Serialnumber of the inverter
            SN: registersToString(result.data.slice(52, 68)),
            // Modbus Device Address
            DA: registersToUint16(result.data.slice(68, 69)),
        };
    }
}
