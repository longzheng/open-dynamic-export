import 'dotenv/config';
import * as v from 'valibot';
import { safeParseIntString } from './number.js';
import { pinoLogger } from './logger.js';

const envSchema = v.object({
    TZ: v.string(),
    SERVER_PORT: v.pipe(v.string(), v.transform(safeParseIntString)),
    CONFIG_DIR: v.string(),
    SEP2_CERT_FILE: v.string(),
    SEP2_KEY_FILE: v.string(),
    SEP2_PEN: v.string(),
    INFLUXDB_HOST: v.optional(v.string()),
    INFLUXDB_PORT: v.optional(
        v.pipe(v.string(), v.transform(safeParseIntString)),
    ),
    INFLUXDB_USERNAME: v.optional(v.string()),
    INFLUXDB_PASSWORD: v.optional(v.string()),
    INFLUXDB_ADMIN_TOKEN: v.optional(v.string()),
    INFLUXDB_ORG: v.optional(v.string()),
    INFLUXDB_BUCKET: v.optional(v.string()),
});

const parsedEnv = v.safeParse(envSchema, process.env);

if (!parsedEnv.success) {
    pinoLogger.error(parsedEnv.issues);
    throw new Error('Invalid environment variables');
}

export const env = parsedEnv.output;
