import 'dotenv/config';
import { getConfig } from '../../helpers/config.js';
import { getSep2Certificate } from '../../helpers/sep2Cert.js';
import {
    getCertificateFingerprint,
    getCertificateLfdi,
    getCertificateSfdi,
} from '../../sep2/helpers/cert.js';

type CertificateIds = {
    lfdi: string;
    sfdi: string;
};

export function getCertificateIds(): CertificateIds {
    const config = getConfig();
    const sep2Certificate = getSep2Certificate(config);
    const fingerprint = getCertificateFingerprint(sep2Certificate.cert);
    const lfdi = getCertificateLfdi(fingerprint);
    const sfdi = getCertificateSfdi(fingerprint);

    return {
        lfdi,
        sfdi,
    };
}
