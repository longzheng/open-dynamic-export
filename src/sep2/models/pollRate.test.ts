import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parsePollRateXmlObject } from './pollRate';

it('should parse poll rate with value XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa_1_derp.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pollRateXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERProgramList'];

    const pollRate = parsePollRateXmlObject(pollRateXmlObject);

    expect(pollRate).toEqual(301);
});

it('should parse poll rate without value XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDcap.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pollRateXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DeviceCapability'];

    const pollRate = parsePollRateXmlObject(pollRateXmlObject);

    expect(pollRate).toEqual(null);
});
