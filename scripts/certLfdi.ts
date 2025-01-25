import { getSep2Certificate } from '../src/helpers/sep2Cert.js';
import {
    formatLfdiWithDashes,
    getCertificateFingerprint,
    getCertificateLfdi,
} from '../src/sep2/helpers/cert.js';

const cert = getSep2Certificate();

const fingerprint = getCertificateFingerprint(cert.cert);
const lfdi = getCertificateLfdi(fingerprint);
console.log(`Device LFDI ${lfdi}`);

const lfdiFormatted = formatLfdiWithDashes(lfdi);
console.log(`Device LFDI formatted with dashes ${lfdiFormatted}`);
