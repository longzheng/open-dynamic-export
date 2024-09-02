import { readFileSync } from 'fs';
import type { Config } from './config';
import { env } from './env';
import { resolve } from 'path';

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
