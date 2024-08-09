import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseDerControlListXml } from './derControlList';

it('should parse DERControlList XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const endDeviceList = parseDerControlListXml(xml);

    expect(endDeviceList.all).toBe(5);
    expect(endDeviceList.subscribable).toBe(true);
    expect(endDeviceList.derControls.length).toBe(5);
});

it('should parse DERControlList XML empty', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_P-EQLDEV3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const endDeviceList = parseDerControlListXml(xml);

    expect(endDeviceList.all).toBe(0);
    expect(endDeviceList.subscribable).toBe(true);
    expect(endDeviceList.derControls.length).toBe(0);
});
