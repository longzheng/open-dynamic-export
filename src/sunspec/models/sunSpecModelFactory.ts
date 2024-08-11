import { logger as pinoLogger } from '../../logger';
import { objectEntriesWithType } from '../../object';
import type { ModelAddress, SunSpecConnection } from '../connection/base';

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

export function sunSpecModelFactory<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Model extends Record<string, any>,
    WriteableKeys extends keyof Model = never,
>(config: {
    name: string;
    mapping: Mapping<Model, WriteableKeys>;
}): {
    read(params: {
        modbusConnection: SunSpecConnection;
        address: ModelAddress;
    }): Promise<Model>;
    write(params: {
        modbusConnection: SunSpecConnection;
        address: ModelAddress;
        values: Pick<Model, WriteableKeys>;
    }): Promise<void>;
} {
    const logger = pinoLogger.child({ module: `sunspec-model-${config.name}` });

    return {
        read: async ({ modbusConnection, address }) => {
            logger.trace({ address }, 'Reading model');

            await modbusConnection.connect();

            const registers =
                await modbusConnection.client.readHoldingRegisters(
                    address.start,
                    address.length,
                );

            logger.trace({ registers }, 'Read registers');

            return convertReadRegisters({
                registers: registers.data,
                mapping: config.mapping,
            });
        },
        write: async ({ modbusConnection, address, values }) => {
            logger.trace({ address, values }, 'Writing model');

            await modbusConnection.connect();

            const registerValues = convertWriteRegisters({
                values,
                mapping: config.mapping,
                length: address.length,
            });

            logger.trace({ registerValues }, 'Converted write registers');

            await modbusConnection.client.writeRegisters(
                address.start,
                registerValues,
            );

            logger.trace({ registerValues }, 'Validating written registers');

            const registers =
                await modbusConnection.client.readHoldingRegisters(
                    address.start,
                    address.length,
                );

            logger.trace({ registers }, 'Read registers');

            // confirm the registers were written correctly
            const writtenValues = convertReadRegisters({
                registers: registers.data,
                mapping: config.mapping,
            });

            objectEntriesWithType(values).forEach(([key, value]) => {
                if (writtenValues[key] !== value) {
                    logger.error(
                        `Failed to write value for key ${key.toString()}. Expected ${value}, got ${writtenValues[key]}`,
                    );
                }
            });
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
    // sunspec allows for writing values to registers that do not support writing, they will simply be ignored
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
