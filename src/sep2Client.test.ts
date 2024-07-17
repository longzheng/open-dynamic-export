import { SEP2Client } from './sep2Client';
import {
    mockDeviceCapabilitiesXml,
    mockTimeLinkXml,
    mockDerControlListXml,
} from './mockXmlPayloads';
import { describe, beforeAll, it, expect } from 'vitest';

// Mock Modbus Client
class MockModbusClient {
    public async setExportLimit(limit: number): Promise<void> {
        console.log(`Mock setExportLimit called with ${limit}`);
    }

    public async setImportLimit(limit: number): Promise<void> {
        console.log(`Mock setImportLimit called with ${limit}`);
    }
}

// Mock fetch setup
const mockFetch = (url: string, options: any) => {
    if (url.includes('/dcap')) {
        return Promise.resolve(
            new Response(mockDeviceCapabilitiesXml, { status: 200 }),
        );
    } else if (url.includes('/time')) {
        return Promise.resolve(new Response(mockTimeLinkXml, { status: 200 }));
    } else if (url.includes('/dercontrol')) {
        return Promise.resolve(
            new Response(mockDerControlListXml, { status: 200 }),
        );
    } else {
        return Promise.reject(new Error('Unknown URL'));
    }
};

(global as any).fetch = mockFetch;

describe('SEP2Client', () => {
    let sep2Client: SEP2Client;

    beforeAll(() => {
        sep2Client = new SEP2Client(
            'http://localhost',
            '/dcap',
            'cert.pem',
            'key.pem',
            12345,
            'localhost',
            502,
        );
        (sep2Client as any).modbusClient = new MockModbusClient(); // Replace Modbus client with a mock
    });

    it('should get device capabilities', async () => {
        const [tmUri, edevUri, mupUri] =
            await sep2Client.getDeviceCapabilities();

        expect(tmUri).toBe('/time');
        expect(edevUri).toBe('/edev');
        expect(mupUri).toBe('/mup');
    });

    it('should check time link', async () => {
        await sep2Client.checkTimeLink('/time');

        // Validate the log output to ensure time sync check
    });

    it('should handle DER control events', async () => {
        await sep2Client.handleDERControl();

        // MockModbusClient should log the setExportLimit and setImportLimit calls
    });
});
