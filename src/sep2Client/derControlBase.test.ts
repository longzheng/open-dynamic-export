import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import { parseDERControlBaseXmlObject } from './derControlBase';

it('should parse DERControlBase XML from DefaultDERControl', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_dderc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlBaseXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DefaultDERControl']['DERControlBase'][0];

    const derControlBase = parseDERControlBaseXmlObject(
        derControlBaseXmlObject,
    );

    expect(derControlBase.opModImpLimW?.value).toBe(15);
    expect(derControlBase.opModExpLimW?.value).toBe(15);
    expect(derControlBase.opModGenLimW).toBe(undefined);
    expect(derControlBase.opModLoadLimW).toBe(undefined);
    expect(derControlBase.opModEnergize).toBe(true);
});

it('should parse DERControlBase XML from DERControlList', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlBaseXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0]['DERControlBase'][0];

    const derControlBase = parseDERControlBaseXmlObject(
        derControlBaseXmlObject,
    );

    expect(derControlBase.opModImpLimW?.value).toBe(3512);
    expect(derControlBase.opModExpLimW?.value).toBe(2512);
    expect(derControlBase.opModGenLimW?.value).toBe(3);
    expect(derControlBase.opModLoadLimW?.value).toBe(3);
    expect(derControlBase.opModEnergize).toBe(undefined);
});