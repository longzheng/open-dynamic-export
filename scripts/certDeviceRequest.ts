import { generateCertRequestAndKey } from '../src/sep2/helpers/cert';

generateCertRequestAndKey({
    csrPath: './config/cert_req.csr',
    keyPath: './config/key.pem',
});
