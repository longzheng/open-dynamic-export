import { generateCertRequestAndKey } from '../src/helpers/cert';

generateCertRequestAndKey({
    csrPath: './config/cert_req.csr',
    keyPath: './config/key.pem',
});
