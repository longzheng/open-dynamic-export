import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseResourceXmlObject } from './resource.js';

it('should parse resource XML object', async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getTm.xml'));
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['Time'];

    const resource = parseResourceXmlObject(xmlObject);

    expect(resource.href).toEqual('/api/v2/tm');
});

it('should parse resource XML object without href', async () => {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(`<Time xmlns="urn:ieee:std:2030.5:ns"
    xmlns:ns2="https://csipaus.org/ns">
</Time>`);
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['Time'];

    const resource = parseResourceXmlObject(xmlObject);

    expect(resource.href).toEqual(undefined);
});
