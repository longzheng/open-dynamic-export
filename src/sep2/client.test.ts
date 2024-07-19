import { SEP2Client } from './client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { beforeAll, it, expect, vi } from 'vitest';
import { getMockFile } from './helpers/mocks';
import { ResponseStatus } from './models/derControlResponse';

const mockAxios = new MockAdapter(axios);

let sep2Client: SEP2Client;

beforeAll(() => {
    sep2Client = new SEP2Client({
        sep2Config: {
            host: 'http://example.com',
            dcapUri: '/dcap',
            pen: 12345,
        },
        cert: mockCert,
        key: mockKey,
    });
});

it('should get device capabilities', async () => {
    mockAxios
        .onGet('http://example.com/dcap')
        .reply(200, getMockFile('getDcap.xml'));

    const { timeLink, endDeviceListLink, mirrorUsagePointListLink } =
        await sep2Client.getDeviceCapabilities();

    expect(timeLink.href).toBe('/api/v2/tm');
    expect(endDeviceListLink.href).toBe('/api/v2/edev');
    expect(mirrorUsagePointListLink.href).toBe('/api/v2/mup');
});

it('should assert time delta successfully', async () => {
    mockAxios
        .onGet('http://example.com/time')
        .reply(200, getMockFile('getTm.xml'));

    // mock system date to match the time in the mock file
    const mockDate = new Date(1682475024000);
    vi.setSystemTime(mockDate);

    await sep2Client.assertTimeDelta('/time');
});

it('should assert time delta with exception', async () => {
    mockAxios
        .onGet('http://example.com/time')
        .reply(200, getMockFile('getTm.xml'));

    // mock system date to not match the time in the mock file
    const mockDate = new Date(1582475024000);
    vi.setSystemTime(mockDate);

    await expect(
        async () => await sep2Client.assertTimeDelta('/time'),
    ).rejects.toThrowError('Clock is not synced with Utility Server');
});

it('should get end device list', async () => {
    mockAxios
        .onGet('http://example.com/edev')
        .reply(200, getMockFile('getEdev.xml'));

    const { endDevices } = await sep2Client.getEndDeviceList('/edev');

    expect(endDevices.length).toBe(3);
});

it('should post DER control response', async () => {
    mockAxios
        .onPost('http://example.com/api/v2/rsps/res-ms/rsp', {
            asymmetricMatch: (value: string) => {
                return value.includes(
                    '<DERControlResponse xmlns="urn:ieee:std:2030.5:ns">',
                );
            },
        })
        .reply(200);

    const response = await sep2Client.postDerControlResponse(
        '/api/v2/rsps/res-ms/rsp',
        {
            createdDateTime: new Date(),
            endDeviceLFDI: '0000',
            status: ResponseStatus.EventReceived,
            subject: '0000',
        },
    );

    expect(response.status).toBe(200);
});

// it('should handle DER control events', async () => {
//     mockAxios
//         .onGet('http://example.com/path/to/dercontrol')
//         .reply(200, getMockFile('getDerp_TESTPROG3_derc.xml'));

//     await sep2Client.handleDERControl();
// });

const mockCert = `-----BEGIN CERTIFICATE-----
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

const mockKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIAyfWUxtA7A4Cz8Xx4lVxnv+OSf3/Yw/GY4WT1mZh+ReoAoGCCqGSM49
AwEHoUQDQgAEMciOg4lGeluSrONxOYF16FQw1QH8lOLmdgOJHgvSw7blVm6waXNn
4vYCjnw1Qhduuq8h0P13SrXDZCXnS90XHg==
-----END EC PRIVATE KEY-----`;
