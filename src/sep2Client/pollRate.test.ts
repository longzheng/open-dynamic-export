import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import { parsePollRateXmlObject } from './pollRate';

it('should parse poll rate XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa_1_derp.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pollRateXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERProgramList'];

    const pollRate = parsePollRateXmlObject(pollRateXmlObject);

    expect(pollRate.pollRate).toEqual(301);
});
