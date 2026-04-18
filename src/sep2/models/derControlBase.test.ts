import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDERControlBaseXmlObject } from './derControlBase.js';

it('should parse DERControlBase XML from DefaultDERControl', async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_dderc.xml'),
    );
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlBaseXmlObject =
        // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DefaultDERControl']['DERControlBase'][0];

    const derControlBase = parseDERControlBaseXmlObject(
        derControlBaseXmlObject,
    );

    expect(derControlBase.opModImpLimW?.value).toBe(15);
    expect(derControlBase.opModExpLimW?.value).toBe(15);
    expect(derControlBase.opModGenLimW).toBe(undefined);
    expect(derControlBase.opModLoadLimW).toBe(undefined);
    expect(derControlBase.opModEnergize).toBe(true);
    expect(derControlBase.opModConnect).toBe(undefined);
});

it('should parse DERControlBase XML from DERControlList', async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlBaseXmlObject =
        // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0]['DERControlBase'][0];

    const derControlBase = parseDERControlBaseXmlObject(
        derControlBaseXmlObject,
    );

    expect(derControlBase.opModImpLimW?.value).toBe(3512);
    expect(derControlBase.opModExpLimW?.value).toBe(2512);
    expect(derControlBase.opModGenLimW?.value).toBe(3);
    expect(derControlBase.opModLoadLimW?.value).toBe(3);
    expect(derControlBase.opModEnergize).toBe(undefined);
    expect(derControlBase.opModConnect).toBe(undefined);
});

it('should parse DERControlBase XML from DERControlList with SAPN CSIP-AUS namespace', async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDerp_derc_sapn.xml'));
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlBaseXmlObject =
        // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0]['DERControlBase'][0];

    const derControlBase = parseDERControlBaseXmlObject(
        derControlBaseXmlObject,
    );

    expect(derControlBase.opModImpLimW?.value).toBe(undefined);
    expect(derControlBase.opModExpLimW?.value).toBe(10000);
    expect(derControlBase.opModGenLimW?.value).toBe(undefined);
    expect(derControlBase.opModLoadLimW?.value).toBe(undefined);
    expect(derControlBase.opModEnergize).toBe(undefined);
    expect(derControlBase.opModConnect).toBe(undefined);
});
