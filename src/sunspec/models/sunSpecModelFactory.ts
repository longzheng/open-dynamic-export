import type { ModbusConnection } from '../modbusConnection';

export function sunSpecModelFactory<
    Model extends Record<string, unknown>,
>(config: {
    addressLength: number;
    mapping: {
        [K in keyof Model]: {
            converter?: (value: number[]) => Model[K];
            start: number;
            end: number;
        };
    };
}): {
    get(params: {
        modbusConnection: ModbusConnection;
        // the starting address for different manufacturers might be different
        addressStart: number;
    }): Promise<Model>;
} {
    return {
        get: async ({ modbusConnection, addressStart }) => {
            await modbusConnection.waitUntilOpen();

            const registers =
                await modbusConnection.client.readHoldingRegisters(
                    addressStart,
                    config.addressLength,
                );

            return {
                ...Object.fromEntries(
                    Object.keys(config.mapping).map((key) => {
                        const { start, end, converter } =
                            config.mapping[key as keyof Model];

                        if (
                            end > registers.data.length ||
                            start > registers.data.length
                        ) {
                            throw new Error(
                                `Invalid register range for key ${key}. Start: ${start}, end: ${end}, registers length: ${registers.data.length}`,
                            );
                        }

                        const value = registers.data.slice(start, end);

                        const convertedValue = (() => {
                            try {
                                return converter ? converter(value) : value;
                            } catch (error) {
                                if (error instanceof Error) {
                                    throw new Error(
                                        `Error converting value for key ${key} with value ${value.toString()}: ${error.message}`,
                                    );
                                }

                                throw error;
                            }
                        })();

                        return [key, convertedValue];
                    }),
                ),
            } as Model;
        },
    };
}
