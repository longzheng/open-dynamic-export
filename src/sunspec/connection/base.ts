import ModbusRTU from 'modbus-serial';
import type { CommonModel } from '../models/common.js';
import { commonModel } from '../models/common.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import { registersToUint32 } from '../helpers/converters.js';
import type { Logger } from 'pino';

const connectionTimeoutMs = 5000;

export type ModelAddress = {
    start: number;
    length: number;
};

type ModelAddressById = Map<number, ModelAddress>;

export abstract class SunSpecConnection {
    public readonly client: ModbusRTU.default;
    public readonly ip: string;
    public readonly port: number;
    public readonly unitId: number;
    public readonly logger: Logger;

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
        this.client = new ModbusRTU.default();
        this.ip = ip;
        this.port = port;
        this.unitId = unitId;
        this.logger = pinoLogger.child({
            module: 'sunspec-connection',
            ip,
            port,
            unitId,
        });

        this.client.on('close', () => {
            this.state = { type: 'disconnected' };

            this.logger.error(`SunSpec Modbus client closed`);
        });

        // This is never observed to be triggered
        this.client.on('error', (error) => {
            this.state = { type: 'disconnected' };

            this.logger.error(error, `SunSpec Modbus client error`);
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
                        this.logger.info(`SunSpec Modbus client connecting`);

                        await this.client.connectTCP(this.ip, {
                            port: this.port,
                            timeout: connectionTimeoutMs,
                        });

                        this.client.setID(this.unitId);
                        this.client.setTimeout(connectionTimeoutMs);

                        this.logger.info(`SunSpec Modbus client connected`);

                        this.state = { type: 'connected' };
                    } catch (error) {
                        this.logger.error(
                            {
                                error,
                            },
                            `SunSpec Modbus client error connecting`,
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
                        this.logger.error(
                            {
                                error,
                            },
                            `SunSpec Modbus client error caching model addresses`,
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

        // cache common model
        // this is not expected to ever change so it can be persisted
        this.commonModelCache = data;

        return data;
    }

    private async scanModelAddresses(): Promise<Map<number, ModelAddress>> {
        await this.connect();

        this.logger.debug(`Scanning SunSpec models for SunSpec Modbus client`);

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

        this.logger.debug(
            {
                count: modelIds.length,
                modelIds,
            },
            `Found SunSpec models for SunSpec Modbus client`,
        );

        return modelAddressById;
    }
}
