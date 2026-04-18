import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseListXmlObject } from './list.js';

it('should parse list XML object', async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const listXmlObject =
        // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList'];

    const list = parseListXmlObject(listXmlObject);

    expect(list.all).toEqual(5);
    expect(list.results).toEqual(5);
});
