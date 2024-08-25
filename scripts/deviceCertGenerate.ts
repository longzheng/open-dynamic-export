import { generateDeviceCertificate } from '../src/helpers/cert';
import { getConfig } from '../src/helpers/config';

const config = getConfig();

generateDeviceCertificate({
    certPath: './config/cert.pem',
    csrPath: './config/cert_req.csr',
    micaCertPath: './config/mica_certificate.pem',
    micaKeyPath: './config/mica_key.pem',
    pen: config.sep2.pen.toString(),
});
