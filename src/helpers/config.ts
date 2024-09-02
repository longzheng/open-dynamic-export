import { z } from 'zod';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { env } from './env';

const sunspecModbusSchema = z.object({
    ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/),
    port: z.number().min(1).max(65535),
    unitId: z.number().min(1).max(255),
});

const configSchema = z.object({
    sep2: z
        .object({
            host: z.string().url(),
            dcapUri: z.string(),
        })
        .optional(),
    sunSpec: z.object({
        inverters: z.array(sunspecModbusSchema),
        meters: z.array(sunspecModbusSchema),
        control: z.boolean(),
    }),
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

export function getSep2Certificate(config: Config) {
    if (!config.sep2) {
        throw new Error('SEP2 is not enabled');
    }

    const cert = readFileSync(resolve(env.SEP2_CERT_PATH), 'utf-8');

    if (!cert) {
        throw new Error('Certificate is not found or is empty');
    }

    const key = readFileSync(resolve(env.SEP2_KEY_PATH), 'utf-8');

    if (!key) {
        throw new Error('Key is not found or is empty');
    }

    return { cert, key };
}
