import { z } from 'zod';
import { readFileSync } from 'fs';
import { env } from './env.js';

const modbusSchema = z.object({
    connection: z.union([
        z.object({
            type: z.literal('tcp'),
            ip: z
                .string()
                .regex(/^(\d{1,3}\.){3}\d{1,3}$/)
                .describe('The IP address of the Modbus device'),
            port: z
                .number()
                .min(1)
                .max(65535)
                .describe('The port of the Modbus device'),
        }),
        z.object({
            type: z.literal('rtu'),
            path: z.string().describe('The device path of the Modbus device'),
            baudRate: z
                .number()
                .min(1)
                .max(115200)
                .describe('The baud rate of the Modbus device'),
        }),
    ]),
    unitId: z
        .number()
        .min(1)
        .max(255)
        .default(1)
        .describe('The unit/slave ID of the Modbus device. Defaults to 1.'),
    pollingIntervalMs: z
        .number()
        .optional()
        .describe(
            'The minimum number of seconds between polling, subject to the latency of the polling loop.',
        )
        .default(200),
});

export type ModbusSchema = z.infer<typeof modbusSchema>;

export const configSchema = z.object({
    setpoints: z
        .object({
            csipAus: z
                .object({
                    host: z
                        .string()
                        .url()
                        .describe('The host of the CSIP-AUS server'),
                    dcapUri: z
                        .string()
                        .describe('The URI of the DeviceCapability resource'),
                    nmi: z
                        .string()
                        .min(10)
                        .max(11)
                        .optional()
                        .describe(
                            'For in-band registration, the NMI of the site',
                        ),
                })
                .optional()
                .describe('If defined, limit by CSIP-AUS server'),
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
                    importLimitWatts: z
                        .number()
                        .min(0)
                        .optional()
                        .describe('The import limit in watts'),
                    loadLimitWatts: z
                        .number()
                        .min(0)
                        .optional()
                        .describe('The load limit in watts'),
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
                            .optional()
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
            mqtt: z
                .object({
                    host: z
                        .string()
                        .describe(
                            'The host of the MQTT broker, including "mqtt://"',
                        ),
                    username: z
                        .string()
                        .optional()
                        .describe('The username for the MQTT broker'),
                    password: z
                        .string()
                        .optional()
                        .describe('The password for the MQTT broker'),
                    topic: z
                        .string()
                        .describe('The topic to pull control limits from'),
                })
                .optional()
                .describe('If defined, limit by MQTT'),
        })
        .describe('Setpoints configuration'),
    inverters: z
        .array(
            z.union([
                z
                    .object({
                        type: z.literal('sunspec'),
                    })
                    .merge(modbusSchema)
                    .describe('SunSpec inverter configuration'),
                z
                    .object({
                        type: z.literal('sunspecfloat'),
                    })
                    .merge(modbusSchema)
                    .describe('SunSpec float inverter configuration'),
                z
                    .object({
                        type: z.literal('sma'),
                        model: z.literal('core1'),
                    })
                    .merge(modbusSchema)
                    .describe('SMA inverter configuration'),
                z
                    .object({
                        type: z.literal('mqtt'),
                        host: z
                            .string()
                            .describe(
                                'The host of the MQTT broker, including "mqtt://"',
                            ),
                        username: z
                            .string()
                            .optional()
                            .describe('The username for the MQTT broker'),
                        password: z
                            .string()
                            .optional()
                            .describe('The password for the MQTT broker'),
                        topic: z
                            .string()
                            .describe(
                                'The topic to pull inverter readings from',
                            ),
                        pollingIntervalMs: z
                            .number()
                            .optional()
                            .describe(
                                'The minimum number of seconds between polling, subject to the latency of the polling loop.',
                            )
                            .default(200),
                    })
                    .describe('MQTT inverter configuration'),
            ]),
        )
        .describe('Inverter configuration'),
    inverterControl: z.object({
        enabled: z.boolean().describe('Whether to control the inverters'),
        sampleSeconds: z
            .number()
            .min(0)
            .describe(
                `How many seconds of inverter and site data to sample to make control decisions.
A shorter time will increase responsiveness to load changes but may introduce oscillations.
A longer time will smooth out load changes but may result in overshoot.`,
            )
            .optional()
            .default(5),
        intervalSeconds: z
            .number()
            .min(0)
            .describe(
                `The minimum number of seconds between control commands, subject to the latency of the control loop.`,
            )
            .optional()
            .default(1),
    }),
    meter: z.union([
        z
            .object({
                type: z.literal('sunspec'),
                location: z.union([
                    z.literal('feedin'),
                    z.literal('consumption'),
                ]),
            })
            .merge(modbusSchema)
            .describe('SunSpec meter configuration'),
        z
            .object({
                type: z.literal('sunspecfloat'),
                location: z.union([
                    z.literal('feedin'),
                    z.literal('consumption'),
                ]),
            })
            .merge(modbusSchema)
            .describe('SunSpec float meter configuration'),

        z
            .object({
                type: z.literal('sma'),
                model: z.literal('core1'),
            })
            .merge(modbusSchema)
            .describe('SMA meter configuration'),
        z
            .object({
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
                timeoutSeconds: z
                    .number()
                    .optional()
                    .describe('Request timeout in seconds')
                    .default(2),
                pollingIntervalMs: z
                    .number()
                    .optional()
                    .describe(
                        'The minimum number of seconds between polling, subject to the latency of the polling loop.',
                    )
                    .default(200),
            })
            .describe('Powerwall 2 meter configuration'),
        z
            .object({
                type: z.literal('mqtt'),
                host: z
                    .string()
                    .describe(
                        'The host of the MQTT broker, including "mqtt://"',
                    ),
                username: z
                    .string()
                    .optional()
                    .describe('The username for the MQTT broker'),
                password: z
                    .string()
                    .optional()
                    .describe('The password for the MQTT broker'),
                topic: z
                    .string()
                    .describe('The topic to pull meter readings from'),
                pollingIntervalMs: z
                    .number()
                    .optional()
                    .describe(
                        'The minimum number of seconds between polling, subject to the latency of the polling loop.',
                    )
                    .default(200),
            })
            .describe('MQTT meter configuration'),
    ]),
    publish: z
        .object({
            mqtt: z
                .object({
                    host: z
                        .string()
                        .describe(
                            'The host of the MQTT broker, including "mqtt://"',
                        ),
                    username: z
                        .string()
                        .optional()
                        .describe('The username for the MQTT broker'),
                    password: z
                        .string()
                        .optional()
                        .describe('The password for the MQTT broker'),
                    topic: z.string().describe('The topic to publish limits'),
                })
                .optional(),
        })
        .describe('Publish active control limits')
        .optional(),
});

export type Config = z.infer<typeof configSchema>;

export type SetpointKeys = keyof Config['setpoints'];

export function getConfigPath() {
    return `${env.CONFIG_DIR}/config.json`;
}

export function getConfig() {
    const configJson = (() => {
        try {
            return readFileSync(getConfigPath(), 'utf8');
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
