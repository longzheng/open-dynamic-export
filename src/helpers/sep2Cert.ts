import { readFileSync } from 'fs';
import { env } from './env.js';
import { resolve } from 'path';

export function getSep2Certificate() {
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
