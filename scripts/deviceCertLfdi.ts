import { getCertificateLfdi } from '../src/helpers/cert';
import { getConfig, getSep2Certificate } from '../src/helpers/config';

const config = getConfig();
const sep2Certificate = getSep2Certificate(config);
const lfdi = getCertificateLfdi(sep2Certificate.cert);

console.log(lfdi);
