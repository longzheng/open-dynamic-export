import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseDeviceCapabilityXml } from './deviceCapability';

it('should parse device capability XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDcap.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const { timeLink, endDeviceListLink, mirrorUsagePointListLink } =
        parseDeviceCapabilityXml(xml);

    expect(timeLink.href).toBe('/api/v2/tm');
    expect(endDeviceListLink.href).toBe('/api/v2/edev');
    expect(mirrorUsagePointListLink.href).toBe('/api/v2/mup');
});
