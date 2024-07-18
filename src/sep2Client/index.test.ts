import { SEP2Client } from './index';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, beforeAll, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

const mock = new MockAdapter(axios);

function mockFileUrl(file: string): string {
    return `${path.join(__dirname, '..', '/tests/sep2/mocks/')}${file}`;
}

describe('SEP2Server', () => {
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
        mock.onGet('http://example.com/dcap').reply(
            200,
            readFileSync(mockFileUrl('getDcap.xml')),
        );

        const { tmUri, edevUri, mupUri } =
            await sep2Client.getDeviceCapabilities();

        expect(tmUri).toBe('/api/v2/tm');
        expect(edevUri).toBe('/api/v2/edev');
        expect(mupUri).toBe('/api/v2/mup');
    });

    it('should check time link', async () => {
        mock.onGet('http://example.com/time').reply(
            200,
            readFileSync(mockFileUrl('getTm.xml')),
        );

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await sep2Client.checkTimeLink('/time');

        // Validate the log output to ensure time sync check
    });

    it('should handle DER control events', async () => {
        mock.onGet('http://example.com/path/to/dercontrol').reply(
            200,
            readFileSync(mockFileUrl('getDerp_TESTPROG3_Derc.xml')),
        );

        await sep2Client.handleDERControl();
    });
});
