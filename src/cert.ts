import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';
import * as crypto from 'crypto';

export function getCertificateLfdi(certString: string) {
    // Remove PEM header and footer
    const pemContent = certString
        .replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\s+/g, '');

    // Convert base64 PEM content to a binary DER buffer
    const derBuffer = Buffer.from(pemContent, 'base64');

    // Parse DER buffer using PKI.js
    const asn1 = asn1js.fromBER(derBuffer);
    const cert = new pkijs.Certificate({ schema: asn1.result });

    // Get the DER encoded certificate again
    const derEncoded = cert.toSchema(true).toBER(false);

    // Calculate the SHA-256 hash of the DER encoded certificate
    const sha256Hash = crypto
        .createHash('sha256')
        .update(Buffer.from(derEncoded))
        .digest('hex');

    // Convert hash to uppercase and take the first 40 characters
    const result = sha256Hash.toUpperCase().slice(0, 40);

    return result;
}
