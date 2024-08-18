import { z } from 'zod';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sunspecModbusSchema = z.object({
    ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/),
    port: z.number().min(1).max(65535),
    unitId: z.number().min(1).max(255),
});

const configSchema = z.object({
    sep2: z.object({
        host: z.string().url(),
        dcapUri: z.string(),
        certPath: z.string(),
        keyPath: z.string(),
        pen: z.number(),
    }),
    sunSpec: z.object({
        inverters: z.array(sunspecModbusSchema),
        meters: z.array(sunspecModbusSchema),
        control: z.boolean(),
    }),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig() {
    const configJson = readFileSync('config.json', 'utf8');

    if (!configJson) {
        throw new Error(`config.json is not found`);
    }

    const result = configSchema.safeParse(JSON.parse(configJson));

    if (!result.success) {
        throw new Error(`config.json is not valid`);
    }

    return result.data;
}

export function getConfigSep2CertKey(config: Config) {
    const sep2Cert = readFileSync(resolve(config.sep2.certPath), 'utf-8');

    if (!sep2Cert) {
        throw new Error('Certificate is not found or is empty');
    }

    const sep2Key = readFileSync(resolve(config.sep2.keyPath), 'utf-8');

    if (!sep2Key) {
        throw new Error('Key is not found or is empty');
    }

    return { sep2Cert, sep2Key };
}
