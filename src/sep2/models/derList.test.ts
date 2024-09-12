import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDerListXml } from './derList.js';

it('should parse DERControlList XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_der.xml'),
    );

    const derList = parseDerListXml(xml);

    expect(derList.all).toBe(1);
    expect(derList.pollRate).toBe(301);
    expect(derList.ders.length).toBe(1);
});
