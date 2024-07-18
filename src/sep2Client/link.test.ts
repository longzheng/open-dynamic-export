import { it, expect } from 'vitest';
import { parseLinkXml } from './link';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';

it('should parse link XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDcap.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const linkXml = xml['DeviceCapability']['EndDeviceListLink'][0];

    const link = parseLinkXml(linkXml);

    expect(link.href).toBe('/api/v2/edev');
});
