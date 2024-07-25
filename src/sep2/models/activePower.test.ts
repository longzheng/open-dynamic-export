import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseActivePowerXmlObject } from './activePower';

it('should parse active power XML with multiplier 2', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_dderc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const limitWattsXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DefaultDERControl']['DERControlBase'][0]['ns2:opModExpLimW'][0];

    const link = parseActivePowerXmlObject(limitWattsXmlObject);

    expect(link.value).toBe(15);
    expect(link.multiplier).toBe(2);
});

it('should parse active power XML with multiplier 0', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const limitWattsXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0]['DERControlBase'][0][
            'ns2:opModExpLimW'
        ][0];

    const link = parseActivePowerXmlObject(limitWattsXmlObject);

    expect(link.value).toBe(2512);
    expect(link.multiplier).toBe(0);
});
