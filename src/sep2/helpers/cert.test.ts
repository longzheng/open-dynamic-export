import { describe, expect, it } from 'vitest';
import {
    formatDateToYYMMDDhhmmssZ,
    getCertificateFingerprint,
    getCertificateLfdi,
    getCertificateSfdi,
    INDEF_EXPIRY,
} from './cert.js';

describe('getCertificateFingerprint', () => {
    it('returns valid LFDI', () => {
        // mock certificate
        const certString = `-----BEGIN CERTIFICATE-----
MIICYzCCAgmgAwIBAgIUanA0NK+hTe21hmSr9D+at8yQHDMwCgYIKoZIzj0EAwIw
gYYxCzAJBgNVBAYTAlhYMRIwEAYDVQQIDAlTdGF0ZU5hbWUxETAPBgNVBAcMCENp
dHlOYW1lMRQwEgYDVQQKDAtDb21wYW55TmFtZTEbMBkGA1UECwwSQ29tcGFueVNl
Y3Rpb25OYW1lMR0wGwYDVQQDDBRDb21tb25OYW1lT3JIb3N0bmFtZTAeFw0yNDA3
MTgwMDE3NDVaFw0zNDA3MTYwMDE3NDVaMIGGMQswCQYDVQQGEwJYWDESMBAGA1UE
CAwJU3RhdGVOYW1lMREwDwYDVQQHDAhDaXR5TmFtZTEUMBIGA1UECgwLQ29tcGFu
eU5hbWUxGzAZBgNVBAsMEkNvbXBhbnlTZWN0aW9uTmFtZTEdMBsGA1UEAwwUQ29t
bW9uTmFtZU9ySG9zdG5hbWUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQxyI6D
iUZ6W5Ks43E5gXXoVDDVAfyU4uZ2A4keC9LDtuVWbrBpc2fi9gKOfDVCF266ryHQ
/XdKtcNkJedL3Rceo1MwUTAdBgNVHQ4EFgQUdEYDPJta6xnRJIA4U1e+keJH09sw
HwYDVR0jBBgwFoAUdEYDPJta6xnRJIA4U1e+keJH09swDwYDVR0TAQH/BAUwAwEB
/zAKBggqhkjOPQQDAgNIADBFAiBfpNrZ7JZKboZn6apjDp52XrFtiGimRP+N8VhR
+ov7KgIhAIb+m/lof7dw7UJzAsQHHdE1r/Ln/p09KFAkymItyygB
-----END CERTIFICATE-----`;

        const fingerprint = getCertificateFingerprint(certString);

        expect(fingerprint).toBe(
            'B9A8A75E324D2312AD09F8DAF9C1295A3CE4142EDE6D372A5D033BE6A4294207',
        );
    });

    it('handles certificate chain', () => {
        // mock certificate
        const certString = `-----BEGIN CERTIFICATE-----
MIICFDCCAbmgAwIBAgIUdEDOsnKk+L4+0VSCplwrQ5ltJqowCgYIKoZIzj0EAwIw
TjELMAkGA1UEBhMCQVUxEzARBgNVBAoMCkxvbmcgWmhlbmcxHjAcBgNVBAMMFVRl
c3QgSUVFRSAyMDMwLjUgTUlDQTEKMAgGA1UEBRMBMTAgFw0yNDA4MTYwMTIyMjda
GA85OTk5MTIzMTIzNTk1OVowADBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABFi5
3L/e1xfpRmya7aYsKQhuyRMcs98FDfVbVqTCl0XBBiIFrzIZovC2pcDyigHGgfzi
YRj90C68XOIsKkd7NKqjgcAwgb0wDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMC
A4gwEwYDVR0jBAwwCoAIQvkEmAkeva8wNAYDVR0RAQH/BCowKKAmBggrBgEFBQcI
BKAaMBgGDCsGAQQBgr4cg+YPAQQIMjAyNDA4MTYwUgYDVR0gAQH/BEgwRjAMBgor
BgEEAYK+HAEBMAwGCisGAQQBgr4cAQMwDAYKKwYBBAGCvhwCATAMBgorBgEEAYK+
HAICMAwGCisGAQQBgr4cAgQwCgYIKoZIzj0EAwIDSQAwRgIhAO60DqsXrMIGLyjM
nLlpTwlL5jyMPmB7F6/qYs6xbLAgAiEA5ggkxAL1hYsBIcXp3ZK98CIaU9bHJWm6
WU+m41Yf3xc=
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIICUjCCAfigAwIBAgIUR+Rs3v2lC/sFb3WYchJTnjHaqSYwCgYIKoZIzj0EAwIw
XDELMAkGA1UEBhMCQVUxHjAcBgNVBAoMFUVuZXJneSBRdWVlbnNsYW5kIEx0ZDEh
MB8GA1UEAwwYVGVzdCBJRUVFIDIwMzAuNSBTRVJDQSAxMQowCAYDVQQFEwExMCAX
DTI0MDgxNTA0MTQyM1oYDzk5OTkxMjMxMjM1OTU5WjBOMQswCQYDVQQGEwJBVTET
MBEGA1UECgwKTG9uZyBaaGVuZzEeMBwGA1UEAwwVVGVzdCBJRUVFIDIwMzAuNSBN
SUNBMQowCAYDVQQFEwExMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqtI7ZbFj
/bJrUyF9Dvl0iiTt3guSpTHgOlwshUdTfZ2bGtZg7G5FKnKu6hJzjFjmZbSjjssC
ZlJiBFdKJYCO5aOBozCBoDASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB/wQE
AwICBDARBgNVHQ4ECgQIQvkEmAkeva8wEwYDVR0jBAwwCoAIStUfRAP9JVIwUgYD
VR0gAQH/BEgwRjAMBgorBQEEAYK+HAEBMAwGCisFAQQBgr4cAQIwDAYKKwUBBAGC
vhwBAzAMBgorBQEEAYK+HAIBMAwGCisFAQQBgr4cAgQwCgYIKoZIzj0EAwIDSAAw
RQIhAOTe3LWFeDG/NXI3cCnA8r5iKiUjqfRdzxYZ80znyVijAiBznhDSgKfAuuE2
OcDz2N2aZbMPb0aJ/PITq+qmVIwTOA==
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIICCDCCAa6gAwIBAgIUcoPPbc7Lde+JnMjzmtZLZ0qRzD0wCgYIKoZIzj0EAwIw
XDELMAkGA1UEBhMCQVUxHjAcBgNVBAoMFUVuZXJneSBRdWVlbnNsYW5kIEx0ZDEh
MB8GA1UEAwwYVGVzdCBJRUVFIDIwMzAuNSBTRVJDQSAxMQowCAYDVQQFEwExMCAX
DTIyMTAzMTAxMzMxNVoYDzk5OTkxMjMxMjM1OTU5WjBcMQswCQYDVQQGEwJBVTEe
MBwGA1UECgwVRW5lcmd5IFF1ZWVuc2xhbmQgTHRkMSEwHwYDVQQDDBhUZXN0IElF
RUUgMjAzMC41IFNFUkNBIDExCjAIBgNVBAUTATEwWTATBgcqhkjOPQIBBggqhkjO
PQMBBwNCAAS047PbL2oVE2LjCloJQKDTEH6fTjjp8w350iml/cVofJ8F3xJkMi1C
bo99WmvBwP9SzRCxe5VdwqelodDNjHTfo0wwSjAPBgNVHRMBAf8EBTADAQH/MA4G
A1UdDwEB/wQEAwIBBjARBgNVHQ4ECgQIStUfRAP9JVIwFAYDVR0gAQH/BAowCDAG
BgRVHSAAMAoGCCqGSM49BAMCA0gAMEUCIC2OWUvblt8Bcl4ov7Vu5YaMFcpwaiSG
EAKsOJor4O3nAiEA49GIjhIUlKVggODrt9nUnhKZcxn0qSmmBAdeN0pd1y8=
-----END CERTIFICATE-----
`;

        const fingerprint = getCertificateFingerprint(certString);

        expect(fingerprint).toBe(
            '0F8872FF54ACDC4A9B789F0872255051D0BDBB64D0E1C7E3FC562F40D852A494',
        );
    });
});

describe('getCertificateLfdi', () => {
    it('returns valid LFDI', () => {
        const lfdi = getCertificateLfdi(
            'B9A8A75E324D2312AD09F8DAF9C1295A3CE4142EDE6D372A5D033BE6A4294207',
        );

        expect(lfdi).toBe('B9A8A75E324D2312AD09F8DAF9C1295A3CE4142E');
    });
});

describe('getCertificateSfdi', () => {
    it('returns valid SFDI', () => {
        const lfdi = getCertificateSfdi(
            '3E4F45AB31EDFE5B67E343E5E4562E31984E23E5349E2AD745672ED145EE213A',
        );

        expect(lfdi).toBe('167261211391');
    });
});

describe('formatDateToYYMMDDhhmmssZ', () => {
    it('indefinite expiry should return expected value', () => {
        const formattedDate = formatDateToYYMMDDhhmmssZ(INDEF_EXPIRY);

        expect(formattedDate).toBe('99991231235959Z');
    });
});
