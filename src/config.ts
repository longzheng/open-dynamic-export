import { z } from 'zod';
import { readFileSync } from 'fs';

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
    sunspecModbus: z.array(sunspecModbusSchema),
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
