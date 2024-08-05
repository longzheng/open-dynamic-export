import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import type { CommonModel } from '../models/common';
import { commonModel } from '../models/common';

const connectionTimeoutMs = 10000;

export abstract class SunSpecConnection {
    public client: ModbusRTU;
    private ip: string;
    private port: number;
    private unitId: number;
    private state: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
    private commonModel: CommonModel | null = null;

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
            this.state = 'disconnected';

            console.error(
                `SunSpec Modbus client closed ${this.ip}:${this.port} Unit ID ${this.unitId}`,
            );
        });

        this.client.on('error', (err) => {
            this.state = 'disconnected';

            console.error(
                `SunSpec Modbus client error ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                err,
            );
        });

        void this.connect();
    }

    private async connect() {
        if (this.state !== 'disconnected') {
            return;
        }

        this.state = 'connecting';

        try {
            console.log(
                `SunSpec Modbus client connecting to ${this.ip}:${this.port} Unit ID ${this.unitId}`,
            );
            await this.client.connectTCP(this.ip, {
                port: this.port,
                timeout: connectionTimeoutMs,
            });

            this.client.setID(this.unitId);
            this.client.setTimeout(connectionTimeoutMs);

            console.log(
                `SunSpec Modbus client connected to ${this.ip}:${this.port} Unit ID ${this.unitId}`,
            );

            this.state = 'connected';

            // cache common model
            // this is not expected to ever change so it can be persisted
            if (!this.commonModel) {
                console.log(
                    `Caching common model for SunSpec Modbus client ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                );
                this.commonModel = await this.getCommonModel();
            }
        } catch (error) {
            console.error(
                `Error connecting to SunSpec Modbus client ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                error,
            );
            this.state = 'disconnected';
        }
    }

    // even though the client may be connected, we cannot send requests until it is "open"
    public async waitUntilOpen() {
        while (this.state !== 'connected') {
            void this.connect();

            await scheduler.wait(1000);
        }
    }

    public async getCachedCommonModel() {
        while (!this.commonModel) {
            await scheduler.wait(1000);
        }

        return this.commonModel;
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
}
