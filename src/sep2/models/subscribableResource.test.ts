import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseSubscribableResourceXmlObject } from './subscribableResource.js';

it('should parse subscribable resource XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getEdev__EQLDEV3.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['EndDevice'];

    const subscriableResource = parseSubscribableResourceXmlObject(xmlObject);

    expect(subscriableResource.subscribable).toEqual(false);
    expect(subscriableResource.href).toEqual('/api/v2/edev/_EQLDEV3');
});
