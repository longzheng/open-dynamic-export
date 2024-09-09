import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseResourceXmlObject } from './resource.js';

it('should parse resource XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getTm.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['Time'];

    const resource = parseResourceXmlObject(xmlObject);

    expect(resource.href).toEqual('/api/v2/tm');
});

it('should parse resource XML object without href', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(`<Time xmlns="urn:ieee:std:2030.5:ns"
    xmlns:ns2="https://csipaus.org/ns">
</Time>`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['Time'];

    const resource = parseResourceXmlObject(xmlObject);

    expect(resource.href).toEqual(undefined);
});
