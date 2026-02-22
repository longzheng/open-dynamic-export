import { readFileSync } from 'fs';
import * as v from 'valibot';
import { env } from './env.js';

const modbusSchema = v.object({
    connection: v.union([
        v.object({
            type: v.literal('tcp'),
            ip: v.pipe(
                v.string(),
                v.regex(/^(\d{1,3}\.){3}\d{1,3}$/),
                v.description('The IP address of the Modbus device'),
            ),
            port: v.pipe(
                v.number(),
                v.minValue(1),
                v.maxValue(65535),
                v.description('The port of the Modbus device'),
            ),
        }),
        v.object({
            type: v.literal('rtu'),
            path: v.pipe(
                v.string(),
                v.description('The device path of the Modbus device'),
            ),
            baudRate: v.pipe(
                v.number(),
                v.minValue(1),
                v.maxValue(115200),
                v.description('The baud rate of the Modbus device'),
            ),
        }),
    ]),
    unitId: v.pipe(
        v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(255)), 1),
        v.description('The unit/slave ID of the Modbus device. Defaults to 1.'),
    ),
    pollingIntervalMs: v.pipe(
        v.optional(v.number(), 200),
        v.description(
            'The minimum number of seconds between polling, subject to the latency of the polling loop.',
        ),
    ),
});

export type ModbusSchema = v.InferOutput<typeof modbusSchema>;

export const configSchema = v.object({
    setpoints: v.pipe(
        v.object({
            csipAus: v.pipe(
                v.optional(
                    v.object({
                        host: v.pipe(
                            v.string(),
                            v.url(),
                            v.description('The host of the CSIP-AUS server'),
                        ),
                        dcapUri: v.pipe(
                            v.string(),
                            v.description(
                                'The URI of the DeviceCapability resource',
                            ),
                        ),
                        nmi: v.pipe(
                            v.optional(
                                v.pipe(
                                    v.string(),
                                    v.minLength(10),
                                    v.maxLength(11),
                                ),
                            ),
                            v.description(
                                'For in-band registration, the NMI of the site',
                            ),
                        ),
                        fixedDefault: v.pipe(
                            v.optional(
                                v.object({
                                    exportLimitWatts: v.pipe(
                                        v.number(),
                                        v.minValue(0),
                                        v.description(
                                            'The default export limit in watts',
                                        ),
                                    ),
                                    importLimitWatts: v.pipe(
                                        v.number(),
                                        v.minValue(0),
                                        v.description(
                                            'The default import limit in watts',
                                        ),
                                    ),
                                }),
                            ),
                            v.description(
                                'The default limits in case CSIP-AUS server is unreachable and there is no default control',
                            ),
                        ),
                    }),
                ),
                v.description('If defined, limit by CSIP-AUS server'),
            ),
            fixed: v.pipe(
                v.optional(
                    v.object({
                        connect: v.pipe(
                            v.optional(v.boolean()),
                            v.description(
                                'Whether the inverter should be connected to the grid',
                            ),
                        ),
                        exportLimitWatts: v.pipe(
                            v.optional(v.pipe(v.number(), v.minValue(0))),
                            v.description('The export limit in watts'),
                        ),
                        generationLimitWatts: v.pipe(
                            v.optional(v.pipe(v.number(), v.minValue(0))),
                            v.description('The generation limit in watts'),
                        ),
                        importLimitWatts: v.pipe(
                            v.optional(v.pipe(v.number(), v.minValue(0))),
                            v.description('The import limit in watts'),
                        ),
                        loadLimitWatts: v.pipe(
                            v.optional(v.pipe(v.number(), v.minValue(0))),
                            v.description('The load limit in watts'),
                        ),
                    }),
                ),
                v.description('If defined, limits by manual configuration'),
            ),
            negativeFeedIn: v.pipe(
                v.optional(
                    v.union([
                        v.object({
                            type: v.literal('amber'),
                            apiKey: v.pipe(
                                v.string(),
                                v.description('The API key for the Amber API'),
                            ),
                            siteId: v.pipe(
                                v.optional(v.string()),
                                v.description('The site ID for the Amber API'),
                            ),
                        }),
                    ]),
                ),
                v.description('If defined, limit by negative feed-in'),
            ),
            twoWayTariff: v.pipe(
                v.optional(
                    v.union([
                        v.object({
                            type: v.literal('ausgridEA029'),
                        }),
                        v.object({
                            type: v.literal('sapnRELE2W'),
                        }),
                    ]),
                ),
                v.description('If defined, limit by two-way tariff'),
            ),
            mqtt: v.pipe(
                v.optional(
                    v.object({
                        host: v.pipe(
                            v.string(),
                            v.description(
                                'The host of the MQTT broker, including "mqtt://"',
                            ),
                        ),
                        username: v.pipe(
                            v.optional(v.string()),
                            v.description('The username for the MQTT broker'),
                        ),
                        password: v.pipe(
                            v.optional(v.string()),
                            v.description('The password for the MQTT broker'),
                        ),
                        topic: v.pipe(
                            v.string(),
                            v.description(
                                'The topic to pull control limits from',
                            ),
                        ),
                    }),
                ),
                v.description('If defined, limit by MQTT'),
            ),
        }),
        v.description('Setpoints configuration'),
    ),
    inverters: v.pipe(
        v.array(
            v.union([
                v.pipe(
                    v.intersect([
                        v.object({
                            type: v.literal('sunspec'),
                        }),
                        modbusSchema,
                    ]),
                    v.description('SunSpec inverter configuration'),
                ),
                v.pipe(
                    v.intersect([
                        v.object({
                            type: v.literal('sma'),
                            model: v.literal('core1'),
                        }),
                        modbusSchema,
                    ]),
                    v.description('SMA inverter configuration'),
                ),
                v.pipe(
                    v.object({
                        type: v.literal('mqtt'),
                        host: v.pipe(
                            v.string(),
                            v.description(
                                'The host of the MQTT broker, including "mqtt://"',
                            ),
                        ),
                        username: v.pipe(
                            v.optional(v.string()),
                            v.description('The username for the MQTT broker'),
                        ),
                        password: v.pipe(
                            v.optional(v.string()),
                            v.description('The password for the MQTT broker'),
                        ),
                        topic: v.pipe(
                            v.string(),
                            v.description(
                                'The topic to pull inverter readings from',
                            ),
                        ),
                        pollingIntervalMs: v.pipe(
                            v.optional(v.number(), 200),
                            v.description(
                                'The minimum number of seconds between polling, subject to the latency of the polling loop.',
                            ),
                        ),
                    }),
                    v.description('MQTT inverter configuration'),
                ),
            ]),
        ),
        v.description('Inverter configuration'),
    ),
    inverterControl: v.object({
        enabled: v.pipe(
            v.boolean(),
            v.description('Whether to control the inverters'),
        ),
        sampleSeconds: v.pipe(
            v.optional(v.pipe(v.number(), v.minValue(0)), 5),
            v.description(
                `How many seconds of inverter and site data to sample to make control decisions.
A shorter time will increase responsiveness to load changes but may introduce oscillations.
A longer time will smooth out load changes but may result in overshoot.`,
            ),
        ),
        intervalSeconds: v.pipe(
            v.optional(v.pipe(v.number(), v.minValue(0)), 1),
            v.description(
                `The minimum number of seconds between control commands, subject to the latency of the control loop.`,
            ),
        ),
    }),
    meter: v.union([
        v.pipe(
            v.intersect([
                v.object({
                    type: v.literal('sunspec'),
                    location: v.union([
                        v.literal('feedin'),
                        v.literal('consumption'),
                    ]),
                }),
                modbusSchema,
            ]),
            v.description('SunSpec meter configuration'),
        ),
        v.pipe(
            v.intersect([
                v.object({
                    type: v.literal('sma'),
                    model: v.literal('core1'),
                }),
                modbusSchema,
            ]),
            v.description('SMA meter configuration'),
        ),
        v.pipe(
            v.object({
                type: v.literal('powerwall2'),
                ip: v.pipe(
                    v.string(),
                    v.regex(/^(\d{1,3}\.){3}\d{1,3}$/),
                    v.description('The IP address of the Powerwall 2 gateway'),
                ),
                password: v.pipe(
                    v.string(),
                    v.description(
                        'The customer password of the Powerwall 2 gateway. By default, this is the last 5 characters of the password sticker inside the gateway.',
                    ),
                ),
                timeoutSeconds: v.pipe(
                    v.optional(v.number(), 2),
                    v.description('Request timeout in seconds'),
                ),
                pollingIntervalMs: v.pipe(
                    v.optional(v.number(), 200),
                    v.description(
                        'The minimum number of seconds between polling, subject to the latency of the polling loop.',
                    ),
                ),
            }),
            v.description('Powerwall 2 meter configuration'),
        ),
        v.pipe(
            v.object({
                type: v.literal('mqtt'),
                host: v.pipe(
                    v.string(),
                    v.description(
                        'The host of the MQTT broker, including "mqtt://"',
                    ),
                ),
                username: v.pipe(
                    v.optional(v.string()),
                    v.description('The username for the MQTT broker'),
                ),
                password: v.pipe(
                    v.optional(v.string()),
                    v.description('The password for the MQTT broker'),
                ),
                topic: v.pipe(
                    v.string(),
                    v.description('The topic to pull meter readings from'),
                ),
                pollingIntervalMs: v.pipe(
                    v.optional(v.number(), 200),
                    v.description(
                        'The minimum number of seconds between polling, subject to the latency of the polling loop.',
                    ),
                ),
            }),
            v.description('MQTT meter configuration'),
        ),
    ]),
    publish: v.pipe(
        v.optional(
            v.object({
                mqtt: v.optional(
                    v.object({
                        host: v.pipe(
                            v.string(),
                            v.description(
                                'The host of the MQTT broker, including "mqtt://"',
                            ),
                        ),
                        username: v.pipe(
                            v.optional(v.string()),
                            v.description('The username for the MQTT broker'),
                        ),
                        password: v.pipe(
                            v.optional(v.string()),
                            v.description('The password for the MQTT broker'),
                        ),
                        topic: v.pipe(
                            v.string(),
                            v.description('The topic to publish limits'),
                        ),
                    }),
                ),
            }),
        ),
        v.description('Publish active control limits'),
    ),
    battery: v.pipe(
        v.optional(
            v.object({
                chargeBufferWatts: v.pipe(
                    v.number(),
                    v.description(
                        'A minimum buffer to allow the battery to charge if export limit would otherwise have prevented the battery from charging',
                    ),
                ),
            }),
        ),
        v.description('Battery configuration'),
    ),
});

export type Config = v.InferOutput<typeof configSchema>;

export type SetpointKeys = keyof Config['setpoints'];

export function getConfigPath() {
    return `${env.CONFIG_DIR}/config.json`;
}

export function getConfig() {
    const configJson = (() => {
        try {
            return readFileSync(getConfigPath(), 'utf8');
        } catch (error) {
            throw new Error(`Error reading ./config/config.json`, {
                cause: error,
            });
        }
    })();

    const result = v.safeParse(configSchema, JSON.parse(configJson));

    if (!result.success) {
        throw new Error(`config.json is not valid`);
    }

    return result.output;
}
