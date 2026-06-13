import { readFileSync } from 'fs';
import * as v from 'valibot';
import { configSchema } from './configSchema.js';
import { env } from './env.js';

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
