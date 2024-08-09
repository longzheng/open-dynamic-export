import { SEP2Client } from './client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { beforeAll, it, expect, vi, describe } from 'vitest';
import { getMockFile } from './helpers/mocks';
import { ResponseStatus } from './models/derControlResponse';
import { RoleFlagsType } from './models/roleFlagsType';
import { mockCert, mockKey } from '../../tests/sep2/cert';

const mockAxios = new MockAdapter(axios);

let sep2Client: SEP2Client;

beforeAll(() => {
    mockAxios
        .onGet('http://example.com/dcap')
        .reply(200, getMockFile('getDcap.xml'));

    mockAxios
        .onGet('http://example.com/api/v2/tm')
        .reply(200, getMockFile('getTm.xml'));

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

// it('discover should get device capabilities and childs', async () => {
//     sep2Client.discover();

//     expect(timeLink.href).toBe('/api/v2/tm');
//     expect(endDeviceListLink.href).toBe('/api/v2/edev');
//     expect(mirrorUsagePointListLink.href).toBe('/api/v2/mup');
// });

// it('should assert time delta successfully', async () => {
//     mockAxios
//         .onGet('http://example.com/time')
//         .reply(200, getMockFile('getTm.xml'));

//     // mock system date to match the time in the mock file
//     const mockDate = new Date(1682475024000);
//     vi.setSystemTime(mockDate);

//     await sep2Client.getTime('/time');
// });

// it('should assert time delta with exception', async () => {
//     mockAxios
//         .onGet('http://example.com/time')
//         .reply(200, getMockFile('getTm.xml'));

//     // mock system date to not match the time in the mock file
//     const mockDate = new Date(1582475024000);
//     vi.setSystemTime(mockDate);

//     await expect(
//         async () => await sep2Client.getTime('/time'),
//     ).rejects.toThrowError('Clock is not synced with Utility Server');
// });

// it('should get end device list', async () => {
//     mockAxios
//         .onGet('http://example.com/edev')
//         .reply(200, getMockFile('getEdev.xml'));

//     const { endDevices } = await sep2Client.getEndDeviceList('/edev');

//     expect(endDevices.length).toBe(3);
// });

// it('should post DER control response', async () => {
//     mockAxios
//         .onPost('http://example.com/api/v2/rsps/res-ms/rsp', {
//             asymmetricMatch: (value: string) => {
//                 return value.includes(
//                     '<DERControlResponse xmlns="urn:ieee:std:2030.5:ns">',
//                 );
//             },
//         })
//         .reply(200);

//     const response = await sep2Client.postDerControlResponse(
//         '/api/v2/rsps/res-ms/rsp',
//         {
//             createdDateTime: new Date(),
//             endDeviceLFDI: '0000',
//             status: ResponseStatus.EventReceived,
//             subject: '0000',
//         },
//     );

//     expect(response.status).toBe(200);
// });

describe('generateUsagePointMrid', () => {
    it('should generate usage point MRID for site', () => {
        const result = sep2Client.generateUsagePointMrid(
            RoleFlagsType.isMirror | RoleFlagsType.isPremisesAggregationPoint,
        );

        expect(result).toBe('B9A8A75E324D2312AD09F80300012345');
    });

    it('should generate usage point MRID for DER', () => {
        const result = sep2Client.generateUsagePointMrid(
            RoleFlagsType.isMirror |
                RoleFlagsType.isDER |
                RoleFlagsType.isSubmeter,
        );

        expect(result).toBe('B9A8A75E324D2312AD09F84900012345');
    });
});

it('should generate meter reading MRID', () => {
    const result = sep2Client.generateMeterReadingMrid();
    const result2 = sep2Client.generateMeterReadingMrid();

    expect(result).toContain('00012345');
    expect(result).not.toBe(result2);
});
