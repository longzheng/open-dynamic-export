import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDERProgramXmlObject } from './derProgram.js';

it('should parse DERProgram XML object with DefaultDERControlLink', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa_2_derp.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derProgramXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERProgramList']['DERProgram'][0];

    const der = parseDERProgramXmlObject(derProgramXmlObject);

    expect(der.href).toBe('/api/v2/derp/TESTPRG3');
    expect(der.mRID).toBe('C7170E2F587E43EE98E51043FECDBA09');
    expect(der.description).toBe('Test Program 3');
    expect(der.version).toBe(1);
    expect(der.defaultDerControlLink?.href).toBe('/api/v2/derp/TESTPRG3/dderc');
    expect(der.derControlListLink?.href).toBe('/api/v2/derp/TESTPRG3/derc');
    expect(der.derCurveListLink?.href).toBe('/api/v2/derp/TESTPRG3/dc');
    expect(der.primacy).toBe(1);
});

it('should parse DERProgram XML object without DefaultDERControlLink', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa_1_derp.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derProgramXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERProgramList']['DERProgram'][0];

    const der = parseDERProgramXmlObject(derProgramXmlObject);

    expect(der.href).toBe('/api/v2/derp/P-_EQLDEV3');
    expect(der.mRID).toBe('C882D1F83246441786FB8278FECDBA09');
    expect(der.description).toBe('_EQLDEV3 Program');
    expect(der.version).toBe(1);
    expect(der.defaultDerControlLink?.href).toBe(undefined);
    expect(der.derControlListLink?.href).toBe('/api/v2/derp/P-_EQLDEV3/derc');
    expect(der.derCurveListLink?.href).toBe('/api/v2/derp/P-_EQLDEV3/dc');
    expect(der.primacy).toBe(102);
});
