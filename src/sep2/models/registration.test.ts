import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseRegistrationXml } from './registration';

it('should parse registration XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_rg.xml'),
    );

    const resource = parseRegistrationXml(xml);

    expect(resource.dateTimeRegistered).toEqual(
        new Date('2013-04-01T00:00:00.000Z'),
    );
    expect(resource.pIN).toEqual(123455);
});
