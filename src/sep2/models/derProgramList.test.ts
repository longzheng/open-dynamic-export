import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDerProgramListXml } from './derProgramList.js';

it('should parse DERProgramList XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa_1_derp.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const derProgramList = parseDerProgramListXml(xml);

    expect(derProgramList.all).toBe(1);
    expect(derProgramList.pollRate).toBe(301);
    expect(derProgramList.derPrograms.length).toBe(1);
});
