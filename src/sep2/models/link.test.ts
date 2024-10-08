import { it, expect } from 'vitest';
import { parseLinkXmlObject } from './link.js';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';

it('should parse link XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDcap.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const linkXmlObject = xml['DeviceCapability']['EndDeviceListLink'][0];

    const link = parseLinkXmlObject(linkXmlObject);

    expect(link.href).toBe('/api/v2/edev');
});
