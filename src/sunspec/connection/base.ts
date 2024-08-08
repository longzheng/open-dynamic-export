import ModbusRTU from 'modbus-serial';
import { scheduler } from 'timers/promises';
import type { CommonModel } from '../models/common';
import { commonModel } from '../models/common';
import { logger as pinoLogger } from '../../logger';

const connectionTimeoutMs = 5000;

const logger = pinoLogger.child({ module: 'sunspec-connection' });

export abstract class SunSpecConnection {
    public client: ModbusRTU;
    private ip: string;
    private port: number;
    private unitId: number;
    private state:
        | { type: 'connected' }
        | { type: 'connecting'; connectPromise: Promise<void> }
        | { type: 'disconnected' } = { type: 'disconnected' };
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
            this.state = { type: 'disconnected' };

            logger.error(
                `SunSpec Modbus client closed ${this.ip}:${this.port} Unit ID ${this.unitId}`,
            );
        });

        // This is never observed to be triggered
        this.client.on('error', (err) => {
            this.state = { type: 'disconnected' };

            logger.error(
                err,
                `SunSpec Modbus client error ${this.ip}:${this.port} Unit ID ${this.unitId}`,
            );
        });

        this.connect().catch(() => {
            // no op
        });
    }

    async connect() {
        switch (this.state.type) {
            case 'connected':
                return;
            case 'connecting':
                return this.state.connectPromise;
            case 'disconnected': {
                const connectPromise = (async () => {
                    try {
                        logger.info(
                            `SunSpec Modbus client connecting to ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                        );

                        await this.client.connectTCP(this.ip, {
                            port: this.port,
                            timeout: connectionTimeoutMs,
                        });

                        this.client.setID(this.unitId);
                        this.client.setTimeout(connectionTimeoutMs);

                        logger.info(
                            `SunSpec Modbus client connected to ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                        );

                        this.state = { type: 'connected' };

                        // cache common model
                        // this is not expected to ever change so it can be persisted
                        if (!this.commonModel) {
                            logger.info(
                                `Caching common model for SunSpec Modbus client ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                            );
                            this.commonModel = await this.getCommonModel();
                        }
                    } catch (error) {
                        logger.error(
                            error,
                            `SunSpec Modbus client error connecting to ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                        );

                        this.state = { type: 'disconnected' };

                        throw error;
                    }
                })();

                this.state = { type: 'connecting', connectPromise };

                return connectPromise;
            }
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
