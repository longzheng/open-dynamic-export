import { generateCertRequestAndKey } from '../src/cert';

generateCertRequestAndKey({ csrPath: 'cert_req.csr', keyPath: 'key.pem' });
