import 'dotenv/config';
import { getCertificateLfdi } from '../src/helpers/cert';
import { getConfig } from '../src/helpers/config';
import { getSep2Certificate } from '../src/helpers/sep2Cert';

const config = getConfig();
const sep2Certificate = getSep2Certificate(config);
const lfdi = getCertificateLfdi(sep2Certificate.cert);

console.log(lfdi);
