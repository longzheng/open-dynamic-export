import { z } from 'zod';
import { readFileSync } from 'fs';

const sunspecModbusSchema = {
    ip: z
        .string()
        .regex(/^(\d{1,3}\.){3}\d{1,3}$/)
        .describe('The IP address of the SunSpec device'),
    port: z
        .number()
        .min(1)
        .max(65535)
        .describe('The port of the SunSpec device'),
    unitId: z
        .number()
        .min(1)
        .max(255)
        .default(1)
        .describe('The unit/slave ID of the SunSpec device. Defaults to 1.'),
};

export const configSchema = z.object({
    limiters: z
        .object({
            sep2: z
                .object({
                    host: z
                        .string()
                        .url()
                        .describe('The host of the SEP2 server'),
                    dcapUri: z
                        .string()
                        .describe('The URI of the DeviceCapability resource'),
                })
                .optional()
                .describe('If defined, limit by CSIP-AUS/SEP2 server'),
            fixed: z
                .object({
                    connect: z
                        .boolean()
                        .optional()
                        .describe(
                            'Whether the inverter should be connected to the grid',
                        ),
                    exportLimitWatts: z
                        .number()
                        .min(0)
                        .optional()
                        .describe('The export limit in watts'),
                    generationLimitWatts: z
                        .number()
                        .min(0)
                        .optional()
                        .describe('The generation limit in watts'),
                })
                .optional()
                .describe('If defined, limits by manual configuration'),
            negativeFeedIn: z
                .union([
                    z.object({
                        type: z.literal('amber'),
                        apiKey: z
                            .string()
                            .describe('The API key for the Amber API'),
                        siteId: z
                            .string()
                            .describe('The site ID for the Amber API'),
                    }),
                    z.never(), // TODO
                ])
                .optional()
                .describe('If defined, limit by negative feed-in'),
            twoWayTariff: z
                .union([
                    z.object({
                        type: z.literal('ausgridEA029'),
                    }),
                    z.object({
                        type: z.literal('sapnRELE2W'),
                    }),
                ])
                .optional()
                .describe('If defined, limit by two-way tariff'),
        })
        .describe('Limiters configuration'),
    inverters: z
        .array(
            z
                .object({
                    type: z.literal('sunspec'),
                    ...sunspecModbusSchema,
                })
                .describe('SunSpec inverter configuration'),
        )
        .describe('Inverter configuration'),
    inverterControl: z.boolean().describe('Whether to control the inverters'),
    meter: z.union([
        z
            .object({
                type: z.literal('sunspec'),
                ...sunspecModbusSchema,
            })
            .describe('SunSpec meter configuration'),
        z.object({
            type: z.literal('powerwall2'),
            ip: z
                .string()
                .regex(/^(\d{1,3}\.){3}\d{1,3}$/)
                .describe('The IP address of the Powerwall 2 gateway'),
            password: z
                .string()
                .describe(
                    'The customer password of the Powerwall 2 gateway. By default, this is the last 5 characters of the password sticker inside the gateway.',
                ),
        }),
    ]),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig() {
    const configJson = (() => {
        try {
            return readFileSync('./config/config.json', 'utf8');
        } catch {
            throw new Error(`Error reading ./config/config.json`);
        }
    })();

    const result = configSchema.safeParse(JSON.parse(configJson));

    if (!result.success) {
        throw new Error(`config.json is not valid`);
    }

    return result.data;
}
