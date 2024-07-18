import { SEP2Client } from './index';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { beforeAll, it, expect, vi } from 'vitest';
import { getMockFile } from './mocks';
const mockAxios = new MockAdapter(axios);

let sep2Client: SEP2Client;

beforeAll(() => {
    sep2Client = new SEP2Client({
        host: 'http://example.com',
        dcapUri: '/dcap',
        certPath: 'cert.pem',
        keyPath: 'key.pem',
        pen: 12345,
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

it('should handle DER control events', async () => {
    mockAxios
        .onGet('http://example.com/path/to/dercontrol')
        .reply(200, getMockFile('getDerp_TESTPROG3_Derc.xml'));

    await sep2Client.handleDERControl();
});
