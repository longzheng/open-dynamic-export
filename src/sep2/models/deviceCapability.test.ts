import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDeviceCapabilityXml } from './deviceCapability.js';

it('should parse device capability XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDcap.xml'));

    const { timeLink, endDeviceListLink, mirrorUsagePointListLink } =
        parseDeviceCapabilityXml(xml);

    expect(timeLink.href).toBe('/api/v2/tm');
    expect(endDeviceListLink.all).toBe(5);
    expect(endDeviceListLink.href).toBe('/api/v2/edev');
    expect(mirrorUsagePointListLink.all).toBe(2);
    expect(mirrorUsagePointListLink.href).toBe('/api/v2/mup');
});
