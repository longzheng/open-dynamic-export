import { generateCertRequestAndKey } from '../src/helpers/cert';

generateCertRequestAndKey({ csrPath: 'cert_req.csr', keyPath: 'key.pem' });
