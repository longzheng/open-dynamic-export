import type { ModbusClient } from '../modbusClient';

export function sunSpecBlockFactory<T extends Record<string, unknown>>(config: {
    address: {
        start: number;
        length: number;
    };
    mapping: {
        [K in keyof T]: {
            converter?: (value: number[]) => T[K];
            start: number;
            end: number;
        };
    };
}): {
    get(modbusClient: ModbusClient): Promise<T>;
} {
    return {
        get: async (modbusClient) => {
            await modbusClient.waitUntilOpen();

            const registers = await modbusClient.client.readHoldingRegisters(
                config.address.start,
                config.address.length,
            );

            return {
                ...Object.fromEntries(
                    Object.keys(config.mapping).map((key) => {
                        const { start, end, converter } =
                            config.mapping[key as keyof T];

                        if (
                            end > registers.data.length ||
                            start > registers.data.length
                        ) {
                            throw new Error(
                                `Invalid register range for key ${key}. Start: ${start}, end: ${end}, registers length: ${registers.data.length}`,
                            );
                        }

                        const value = registers.data.slice(start, end);

                        return [key, converter ? converter(value) : value];
                    }),
                ),
            } as T;
        },
    };
}
