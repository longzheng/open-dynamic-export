import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import { parseLimitWattsXmlObject } from './limitWatts';

it('should parse limit watts XML with multiplier 2', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_dderc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const limitWattsXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DefaultDERControl']['DERControlBase'][0]['ns2:opModExpLimW'][0];

    const link = parseLimitWattsXmlObject(limitWattsXmlObject);

    expect(link.value).toBe(15);
    expect(link.powerOfTenMultiplier).toBe(2);
    expect(link.watts).toBe(1500);
});

it('should parse limit watts XML with multiplier 0', async () => {
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

    const link = parseLimitWattsXmlObject(limitWattsXmlObject);

    expect(link.value).toBe(2512);
    expect(link.powerOfTenMultiplier).toBe(0);
    expect(link.watts).toBe(2512);
});
