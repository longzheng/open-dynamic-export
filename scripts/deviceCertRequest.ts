import { existsSync, writeFileSync } from 'fs';
import { KEYUTIL, KJUR } from 'jsrsasign';

const csrFileName = 'cert_req.csr';
const keyFileName = 'key.pem';

if (existsSync(csrFileName)) {
    console.log(
        `Device certificate signing request file "${csrFileName}" exists, aborting to prevent overwrite`,
    );
    process.exit(1);
}

if (existsSync(keyFileName)) {
    console.log(
        `Device certificate private key file "${keyFileName}" exists, aborting to prevent overwrite`,
    );
    process.exit(1);
}

const keyPair = KEYUTIL.generateKeypair('EC', 'secp256r1');

const publicKey = KEYUTIL.getPEM(keyPair.pubKeyObj);
const privateKey = KEYUTIL.getPEM(keyPair.prvKeyObj, 'PKCS8PRV');

const csr = new KJUR.asn1.csr.CertificationRequest({
    subject: { str: '' },
    sbjpubkey: publicKey,
    sigalg: 'SHA256withECDSA',
    sbjprvkey: privateKey,
});

const pem = csr.getPEM();

writeFileSync(csrFileName, pem);
console.log(`Device certificate signing request file "${csrFileName}" created`);

writeFileSync(keyFileName, privateKey);
console.log(`Device certificate private key file "${keyFileName}" created`);
