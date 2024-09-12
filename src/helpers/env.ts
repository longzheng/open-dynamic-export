import z from 'zod';
import { safeParseIntString } from './number.js';
import { logger } from './logger.js';

const envSchema = z.object({
    SERVER_PORT: z.string().transform(safeParseIntString),
    SEP2_CERT_PATH: z.string(),
    SEP2_KEY_PATH: z.string(),
    SEP2_PEN: z.string(),
    INFLUXDB_USERNAME: z.string(),
    INFLUXDB_PASSWORD: z.string(),
    INFLUXDB_ADMIN_TOKEN: z.string(),
    INFLUXDB_ORG: z.string(),
    INFLUXDB_BUCKET: z.string(),
    INFLUXDB_PORT: z.string().transform(safeParseIntString),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    logger.error(parsedEnv.error);
    throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;
