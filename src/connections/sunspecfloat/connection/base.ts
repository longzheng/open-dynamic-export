import { type CommonModel } from '../../sunspec/models/common.js';
import { commonModel } from '../../sunspec/models/common.js';
import { registersToUint32 } from '../../modbus/helpers/converters.js';
import { type ModbusConnection } from '../../modbus/connection/base.js';
import { getModbusConnection } from '../../modbus/connections.js';
import { type Logger } from 'pino';
import { type ModbusSchema } from '../../../helpers/config.js';

export type ModelAddress = {
    start: number;
    length: number;
};

type ModelAddressById = Map<number, ModelAddress>;

export abstract class SunSpecfloatConnection {
    protected readonly modbusConnection: ModbusConnection;
    protected readonly unitId: number;
    private logger: Logger;

    private modelAddressById:
        | { type: 'cached'; cache: ModelAddressById }
        | { type: 'caching'; cachePromise: Promise<ModelAddressById> }
        | { type: 'notCached' } = { type: 'notCached' };
    private commonModelCache: CommonModel | null = null;

    constructor({ connection, unitId }: ModbusSchema) {
        this.modbusConnection = getModbusConnection(connection);
        this.unitId = unitId;
        this.logger = this.modbusConnection.logger.child({
            module: 'SunSpecfloatConnection',
            unitId,
        });
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
                        this.logger.debug(
                            error,
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
            modbusConnection: this.modbusConnection,
            address,
            unitId: this.unitId,
        });

        // cache common model
        // this is not expected to ever change so it can be persisted
        this.commonModelCache = data;

        return data;
    }

    private async scanModelAddresses(): Promise<Map<number, ModelAddress>> {
        await this.modbusConnection.connect();

        this.logger.debug(`Scanning SunSpec models for SunSpec Modbus client`);

        // 40002 is a well-known base address
        let currentAddress = 40000;

        // read the first two registers to get the model ID and length
        const response = await this.modbusConnection.readRegisters({
            type: 'holding',
            unitId: this.unitId,
            start: currentAddress,
            length: 2,
        });

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
            await this.modbusConnection.connect();

            // read the first two registers to get the model ID and length
            const response = await this.modbusConnection.readRegisters({
                type: 'holding',
                unitId: this.unitId,
                start: currentAddress,
                length: 2,
            });

            const modelId = response.data.at(0);
            const modelLength = response.data.at(1);

            if (modelId === undefined || modelLength === undefined) {
                throw new Error('Model ID or length not found');
            }

            if (modelId === 0xffff && modelLength === 0) {
                break;
            }
            
            this.logger.debug(
            {
                currentAddress,
            },
            `Start Adress is ${currentAddress}`,
            );

            // Special condition to fix the inverter reporting a modellength that is too long and causing a modbus read error
            if (modelId === 213) {
                // Store the reduced length for your application logic
                modelAddressById.set(modelId, {
                    start: currentAddress,
                    length: modelLength + 1, // or whatever your special logic requires
                });
                // But always advance by modelLength + 2
                currentAddress += modelLength + 2;
            } else {
                modelAddressById.set(modelId, {
                    start: currentAddress,
                    length: modelLength + 2,
                });
                currentAddress += modelLength + 2;
            }
            
            this.logger.debug(
            {
                currentAddress,
            },
            `End Adress is ${currentAddress}`,
            );
            

            this.logger.debug(
            {
                modelId,
                modelLength,
            },
            `For ${modelId} the model length is ${modelLength}`,
        );
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

    public onDestroy(): void {
        this.modbusConnection.destroy();
    }
}
