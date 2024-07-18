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

    expect(derControlBase.siteImportLimitWatts?.watts).toBe(1500);
    expect(derControlBase.siteExportLimitWatts?.watts).toBe(1500);
    expect(derControlBase.generationLimit).toBe(undefined);
    expect(derControlBase.loadLimit).toBe(undefined);
    expect(derControlBase.energize).toBe(true);
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

    expect(derControlBase.siteImportLimitWatts?.watts).toBe(3512);
    expect(derControlBase.siteExportLimitWatts?.watts).toBe(2512);
    expect(derControlBase.generationLimit?.watts).toBe(30000);
    expect(derControlBase.loadLimit?.watts).toBe(30000);
    expect(derControlBase.energize).toBe(undefined);
});
