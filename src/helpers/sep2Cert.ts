import { readFileSync } from 'fs';
import { env } from './env.js';

export function getSep2Certificate() {
    const cert = readFileSync(
        `${env.CONFIG_DIR}/${env.SEP2_CERT_FILE}`,
        'utf-8',
    );

    if (!cert) {
        throw new Error('Certificate is not found or is empty');
    }

    const cacert = readFileSync(
        `${env.CONFIG_DIR}/${env.SEP2_CACERT_FILE}`,
        'utf-8',
    );

    if (!cert) {
        throw new Error('Certificate is not found or is empty');
    }

    const key = readFileSync(`${env.CONFIG_DIR}/${env.SEP2_KEY_FILE}`, 'utf-8');

    if (!key) {
        throw new Error('Key is not found or is empty');
    }

    return { cert, cacert, key };
}
