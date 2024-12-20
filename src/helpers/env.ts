import 'dotenv/config';
import z from 'zod';
import { safeParseIntString } from './number.js';
import { pinoLogger } from './logger.js';

const envSchema = z.object({
    TZ: z.string(),
    SERVER_PORT: z.string().transform(safeParseIntString),
    CONFIG_DIR: z.string(),
    SEP2_CERT_FILE: z.string(),
    SEP2_KEY_FILE: z.string(),
    SEP2_PEN: z.string(),
    INFLUXDB_USERNAME: z.string().optional(),
    INFLUXDB_PASSWORD: z.string().optional(),
    INFLUXDB_ADMIN_TOKEN: z.string().optional(),
    INFLUXDB_ORG: z.string().optional(),
    INFLUXDB_BUCKET: z.string().optional(),
    INFLUXDB_PORT: z.string().transform(safeParseIntString).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    pinoLogger.error(parsedEnv.error);
    throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;
