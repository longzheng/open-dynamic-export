import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import { parseDerControlListXml } from './derControlList';

it('should parse DERControlList XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const endDeviceList = parseDerControlListXml(xml);

    expect(endDeviceList.list.all).toBe(5);
    expect(endDeviceList.subscribable).toBe(true);
    expect(endDeviceList.derControls.length).toBe(5);
    expect(endDeviceList.derControls[0]?.mRID).toBe(
        'DC1B27AC943B44AC87DAF7E162B6F6D4',
    );
});
