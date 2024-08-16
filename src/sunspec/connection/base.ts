import ModbusRTU from 'modbus-serial';
import type { CommonModel } from '../models/common';
import { commonModel } from '../models/common';
import { logger as pinoLogger } from '../../logger';
import { registersToUint32 } from '../helpers/converters';

const connectionTimeoutMs = 5000;

const logger = pinoLogger.child({ module: 'sunspec-connection' });

export type ModelAddress = {
    start: number;
    length: number;
};

type ModelAddressById = Map<number, ModelAddress>;

export abstract class SunSpecConnection {
    public readonly client: ModbusRTU;
    public readonly ip: string;
    public readonly port: number;
    public readonly unitId: number;

    private state:
        | { type: 'connected' }
        | { type: 'connecting'; connectPromise: Promise<void> }
        | { type: 'disconnected' } = { type: 'disconnected' };

    private modelAddressById:
        | { type: 'cached'; cache: ModelAddressById }
        | { type: 'caching'; cachePromise: Promise<ModelAddressById> }
        | { type: 'notCached' } = { type: 'notCached' };

    private commonModelCache: CommonModel | null = null;

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

    protected async getModelAddressById() {
        switch (this.modelAddressById.type) {
            case 'cached':
                return this.modelAddressById.cache;
            case 'caching':
                return this.modelAddressById.cachePromise;
            case 'notCached': {
                const cachePromise = (async () => {
                    try {
                        const modelAddressById =
                            await this.scanModelAddresses();

                        this.modelAddressById = {
                            type: 'cached',
                            cache: modelAddressById,
                        };

                        return modelAddressById;
                    } catch (error) {
                        logger.error(
                            error,
                            `SunSpec Modbus client error caching model addresses ${this.ip}:${this.port} Unit ID ${this.unitId}`,
                        );

                        this.modelAddressById = { type: 'notCached' };

                        throw error;
                    }
                })();

                this.modelAddressById = { type: 'caching', cachePromise };

                return cachePromise;
            }
        }
    }

    public async getCommonModel() {
        if (this.commonModelCache) {
            return this.commonModelCache;
        }

        const modelAddressById = await this.getModelAddressById();

        const address = modelAddressById.get(1);

        if (!address) {
            throw new Error('No SunSpec inverter common model address');
        }

        const data = await commonModel.read({
            modbusConnection: this,
            address,
        });

        if (data.ID !== 1) {
            throw new Error('Not a SunSpec common model');
        }

        // cache common model
        // this is not expected to ever change so it can be persisted
        this.commonModelCache = data;

        return data;
    }

    private async scanModelAddresses(): Promise<Map<number, ModelAddress>> {
        await this.connect();

        logger.info(
            `Scanning SunSpec models for SunSpec Modbus client ${this.ip}:${this.port} Unit ID ${this.unitId}`,
        );

        // 40002 is a well-known base address
        let currentAddress = 40000;

        // read the first two registers to get the model ID and length
        const response = await this.client.readHoldingRegisters(
            currentAddress,
            2,
        );

        const SID = registersToUint32(response.data);

        // SID is a well-known value. Uniquely identifies this as a SunSpec Modbus Map
        // assert this is the case or this isn't SunSpec
        // 0x53756e53 ('SunS')
        if (SID !== 0x53756e53) {
            throw new Error('Not a SunSpec device');
        }

        // Move to the first model address
        currentAddress += 2;

        const modelAddressById = new Map<number, ModelAddress>();

        for (;;) {
            await this.connect();

            // read the first two registers to get the model ID and length
            const response = await this.client.readHoldingRegisters(
                currentAddress,
                2,
            );
            const modelId = response.data.at(0);
            const modelLength = response.data.at(1);

            if (modelId === undefined || modelLength === undefined) {
                throw new Error('Model ID or length not found');
            }

            if (modelId === 0xffff && modelLength === 0) {
                break;
            }

            modelAddressById.set(modelId, {
                start: currentAddress,
                length: modelLength + 2, // +2 accounts for model ID and length fields
            });

            // Move to the next model's address
            currentAddress += modelLength + 2; // +2 accounts for model ID and length fields
        }

        const modelIds = Array.from(modelAddressById.keys());

        logger.info(
            `Found ${modelIds.length} SunSpec models for SunSpec Modbus client ${this.ip}:${this.port} Unit ID ${this.unitId}: ${modelIds.join(', ')}`,
        );

        return modelAddressById;
    }
}
