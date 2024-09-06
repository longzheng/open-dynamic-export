import { generateDeviceCertificate } from '../src/sep2/helpers/cert';
import { env } from '../src/helpers/env';

generateDeviceCertificate({
    certPath: './config/cert.pem',
    csrPath: './config/cert_req.csr',
    micaCertPath: './config/mica_certificate.pem',
    micaKeyPath: './config/mica_key.pem',
    pen: env.SEP2_PEN,
});
