import 'dotenv/config';
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
    const sep2Certificate = getSep2Certificate();
    const fingerprint = getCertificateFingerprint(sep2Certificate.cert);
    const lfdi = getCertificateLfdi(fingerprint);
    const sfdi = getCertificateSfdi(fingerprint);

    return {
        lfdi,
        sfdi,
    };
}
