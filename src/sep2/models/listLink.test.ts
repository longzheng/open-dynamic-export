import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseListLinkXmlObject } from './listLink';

it('should parse list link XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDcap.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const listXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DeviceCapability']['EndDeviceListLink'][0];

    const listLinkObject = parseListLinkXmlObject(listXmlObject);

    expect(listLinkObject.all).toEqual(5);
    expect(listLinkObject.href).toEqual('/api/v2/edev');
});
