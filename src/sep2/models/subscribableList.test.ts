import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseSubscribableListXmlObject } from './subscribableList';

it('should parse subscribable list XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getEdev.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['EndDeviceList'];

    const subscribableList = parseSubscribableListXmlObject(xmlObject);

    expect(subscribableList.subscribable).toEqual(true);
    expect(subscribableList.href).toEqual('/api/v2/edev');
    expect(subscribableList.all).toEqual(5);
});
