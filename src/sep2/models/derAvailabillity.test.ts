import { it, expect } from 'vitest';
import { objectToXml } from '../helpers/xml.js';
import { generateDerAvailabilityResponse } from './derAvailabillity.js';
import { validateXml } from '../helpers/xsdValidator.js';

it('should generate DERAvailability XML', () => {
    const response = generateDerAvailabilityResponse({
        readingTime: new Date(1514793600000),
    });

    const xml = objectToXml(response);

    expect(xml).toBe(`<?xml version="1.0"?>
<DERAvailability xmlns="urn:ieee:std:2030.5:ns">
    <readingTime>1514793600</readingTime>
</DERAvailability>`);
});

it('should generate XSD-valid DERAvailability XML', () => {
    const response = generateDerAvailabilityResponse({
        readingTime: new Date(1514793600000),
    });

    const xml = objectToXml(response);
    const validation = validateXml(xml);

    expect(validation.valid).toBe(true);
});
