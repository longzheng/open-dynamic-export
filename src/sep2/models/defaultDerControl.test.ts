import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDefaultDERControlXml } from './defaultDerControl.js';

it('should parse Default DER Control XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_dderc.xml'),
    );

    const defaultDerControl = parseDefaultDERControlXml(xml);

    expect(defaultDerControl.mRID).toBe('E6F3A83FC1E64929BB4502AA0CEA0FDB');
    expect(defaultDerControl.version).toBe(0);
    expect(defaultDerControl.derControlBase.opModExpLimW?.value).toBe(15);
    expect(defaultDerControl.setGradW).toBe(undefined);
    expect(defaultDerControl.setSoftGradW).toStrictEqual(1);
});

it('should parse Default DER Control XML with SAPN CSIP-AUS namespace', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getDerp_dderc_sapn.xml'));

    const defaultDerControl = parseDefaultDERControlXml(xml);

    expect(defaultDerControl.mRID).toBe('03e42dbac664c4e066e77a5d00054666');
    expect(defaultDerControl.version).toBe(0);
    expect(defaultDerControl.derControlBase.opModExpLimW?.value).toBe(1500);
    expect(defaultDerControl.derControlBase.opModExpLimW?.multiplier).toBe(0);
    expect(defaultDerControl.setGradW).toBe(27);
});
