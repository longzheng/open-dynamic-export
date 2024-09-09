import { it, expect } from 'vitest';
import {
    generateDerControlResponse,
    ResponseStatus,
} from './derControlResponse.js';
import { objectToXml } from '../helpers/xml.js';

it('should generate DERControlResponse XML', () => {
    const response = generateDerControlResponse({
        createdDateTime: new Date(1682475000 * 1000),
        endDeviceLFDI: '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
        status: ResponseStatus.EventReceived,
        subject: 'DC1B27AC943B44AC87DAF7E162B6F6D4',
    });

    const xml = objectToXml(response);

    expect(xml).toBe(`<?xml version="1.0"?>
<DERControlResponse xmlns="urn:ieee:std:2030.5:ns">
    <createdDateTime>1682475000</createdDateTime>
    <endDeviceLFDI>4075DE6031E562ACF4D9EAA765A5B2ED00057269</endDeviceLFDI>
    <status>1</status>
    <subject>DC1B27AC943B44AC87DAF7E162B6F6D4</subject>
</DERControlResponse>`);
});
