import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseIdentifiedObjectXmlObject } from './identifiedObject.js';

it('should parse identified object XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0];

    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);

    expect(identifiedObject.href).toBe(
        '/api/v2/derp/TESTPRG3/derc/DC1B27AC943B44AC87DAF7E162B6F6D4',
    );
    expect(identifiedObject.mRID).toBe('DC1B27AC943B44AC87DAF7E162B6F6D4');
    expect(identifiedObject.description).toBe('Scheduled DERC');
    expect(identifiedObject.version).toBe(0);
});

it('should parse identified object XML with optional description', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][1];

    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);

    expect(identifiedObject.href).toBe(
        '/api/v2/derp/TESTPRG3/derc/737A28BE154F4050BFB61D24202C0983',
    );
    expect(identifiedObject.mRID).toBe('737A28BE154F4050BFB61D24202C0983');
    expect(identifiedObject.description).toBe(undefined);
    expect(identifiedObject.version).toBe(0);
});
