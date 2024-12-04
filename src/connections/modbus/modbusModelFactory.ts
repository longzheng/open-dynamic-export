import { writeLatency } from '../../helpers/influxdb.js';
import { objectEntriesWithType } from '../../helpers/object.js';
import { type ModelAddress } from '../sunspec/connection/base.js';
import { type ModbusConnection } from './connection/base.js';

export type Mapping<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Model extends Record<string, any>,
    WriteableKeys extends keyof Model,
> = {
    [Key in keyof Model]: {
        readConverter: (value: number[]) => Model[Key];
        start: number;
        end: number;
    } & (Key extends WriteableKeys
        ? // if the key is writeable, it must have a writeConverter
          { writeConverter: (value: Model[Key]) => number[] }
        : { writeConverter?: undefined });
};

export function modbusModelFactory<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Model extends Record<string, any>,
    WriteableKeys extends keyof Model = never,
>(config: {
    name: string;
    mapping: Mapping<Model, WriteableKeys>;
}): {
    read(params: {
        modbusConnection: ModbusConnection;
        address: ModelAddress;
        unitId: number;
    }): Promise<Model>;
    write(params: {
        modbusConnection: ModbusConnection;
        address: ModelAddress;
        unitId: number;
        values: Pick<Model, WriteableKeys>;
    }): Promise<void>;
} {
    return {
        read: async ({ modbusConnection, address, unitId }) => {
            const logger = modbusConnection.logger.child({
                module: 'modbusModelFactory',
                model: config.name,
                type: 'read',
            });

            const start = performance.now();

            await modbusConnection.connect();

            const registers = await modbusConnection.readRegisters({
                type: 'holding',
                unitId,
                start: address.start,
                length: address.length,
            });

            const end = performance.now();
            const duration = end - start;

            writeLatency({
                field: 'sunSpecModelFactory',
                duration,
                tags: {
                    operation: 'read',
                    connectionType: modbusConnection.config.type,
                    connectionAddress: (() => {
                        switch (modbusConnection.config.type) {
                            case 'tcp': {
                                return `${modbusConnection.config.ip}:${modbusConnection.config.port}`;
                            }
                            case 'rtu': {
                                return modbusConnection.config.path;
                            }
                        }
                    })(),
                    unitId: unitId.toString(),
                    model: config.name,
                    addressStart: address.start.toString(),
                    addressLength: address.length.toString(),
                },
            });

            logger.trace(
                { duration, registers: registers.data },
                'Read registers',
            );

            return convertReadRegisters({
                registers: registers.data,
                mapping: config.mapping,
            });
        },
        write: async ({ modbusConnection, address, unitId, values }) => {
            const logger = modbusConnection.logger.child({
                module: 'modbusModelFactory',
                model: config.name,
                type: 'write',
            });

            const start = performance.now();

            const registerValues = convertWriteRegisters({
                values,
                mapping: config.mapping,
                length: address.length,
            });

            await modbusConnection.connect();

            await modbusConnection.writeRegisters({
                type: 'holding',
                unitId,
                start: address.start,
                data: registerValues,
            });

            const end = performance.now();
            const duration = end - start;

            writeLatency({
                field: 'sunSpecModelFactory',
                duration,
                tags: {
                    operation: 'write',
                    connectionType: modbusConnection.config.type,
                    connectionAddress: (() => {
                        switch (modbusConnection.config.type) {
                            case 'tcp': {
                                return `${modbusConnection.config.ip}:${modbusConnection.config.port}`;
                            }
                            case 'rtu': {
                                return modbusConnection.config.path;
                            }
                        }
                    })(),
                    unitId: unitId.toString(),
                    model: config.name,
                    addressStart: address.start.toString(),
                    addressLength: address.length.toString(),
                },
            });

            logger.trace({ duration, registerValues }, 'Wrote registers');
        },
    };
}

export function convertReadRegisters<
    Model extends Record<string, unknown>,
    WriteableKeys extends keyof Model = never,
>({
    registers,
    mapping,
}: {
    registers: number[];
    mapping: Mapping<Model, WriteableKeys>;
}): Model {
    return {
        ...Object.fromEntries(
            objectEntriesWithType(mapping).map(
                ([key, { start, end, readConverter }]) => {
                    const value = registers.slice(start, end);

                    const convertedValue = (() => {
                        try {
                            return readConverter(value);
                        } catch (error) {
                            if (error instanceof Error) {
                                throw new Error(
                                    `Error converting read value for key ${key.toString()} with value ${value.toString()}: ${error.message}`,
                                );
                            }

                            throw error;
                        }
                    })();

                    return [key, convertedValue];
                },
            ),
        ),
    } as Model;
}

export function convertWriteRegisters<
    Model extends Record<string, unknown>,
    WriteableKeys extends keyof Model = never,
>({
    values,
    mapping,
    length,
}: {
    values: Pick<Model, WriteableKeys>;
    mapping: Mapping<Model, WriteableKeys>;
    length: number;
}): number[] {
    // modbus allows for writing values to registers that do not support writing, they will simply be ignored
    // we use this behaviour as a shortcut to use the same model definition and start address for reading and writing

    // start with all empty registers
    const registers = Array<number>(length).fill(0);

    objectEntriesWithType(values).forEach(([key, value]) => {
        const { start, end, writeConverter } = mapping[key];

        if (!writeConverter) {
            return;
        }

        const convertedValue = (() => {
            try {
                return (
                    writeConverter as (
                        // overcome TypeScript type issue
                        value: Model[WriteableKeys],
                    ) => number[]
                )(value);
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(
                        `Error converting write value for key ${key.toString()} with value ${String(value)}: ${error.message}`,
                    );
                }

                throw error;
            }
        })();

        const length = end - start;

        if (convertedValue.length !== length) {
            throw new Error(
                `Invalid write value for key ${key.toString()}. Expected length ${length}, got ${convertedValue.length}`,
            );
        }

        registers.splice(start, length, ...convertedValue);
    });

    return registers;
}
