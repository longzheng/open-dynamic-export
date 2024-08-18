import { getCertificateLfdi } from '../src/helpers/cert';
import { getConfig, getConfigSep2CertKey } from '../src/helpers/config';

const config = getConfig();
const { sep2Cert } = getConfigSep2CertKey(config);
const lfdi = getCertificateLfdi(sep2Cert);

console.log(lfdi);
