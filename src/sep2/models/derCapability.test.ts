import { it, expect } from 'vitest';
import { objectToXml } from '../helpers/xml.js';
import { generateDerCapability } from './derCapability.js';
import { DERControlType } from './derControlType.js';
import { DOEControlType } from './doeModesSupportedType.js';
import { DERType } from './derType.js';
import { validateXml } from '../helpers/xsdValidator.js';

it('should generate DERCapability XML', () => {
    const response = generateDerCapability({
        modesSupported:
            DERControlType.opModEnergize |
            DERControlType.opModFixedW |
            DERControlType.opModMaxLimW |
            DERControlType.opModTargetW,
        doeModesSupported:
            DOEControlType.opModExpLimW |
            DOEControlType.opModGenLimW |
            DOEControlType.opModImpLimW |
            DOEControlType.opModLoadLimW,
        type: DERType.VirtualOrMixedDER,
        rtgMaxVA: {
            multiplier: 3,
            value: 52.5,
        },
        rtgMaxW: {
            multiplier: 3,
            value: 50,
        },
        rtgMaxVar: {
            multiplier: 3,
            value: 2.5,
        },
        rtgMaxVarNeg: {
            multiplier: 3,
            value: -2.5,
        },
        rtgMinPFOverExcited: {
            displacement: 900,
            multiplier: -3,
        },
        rtgMinPFUnderExcited: {
            displacement: 900,
            multiplier: -3,
        },
        rtgVNom: {
            multiplier: 0,
            value: 230,
        },
    });

    const xml = objectToXml(response);

    expect(xml).toBe(`<?xml version="1.0"?>
<DERCapability xmlns="urn:ieee:std:2030.5:ns" xmlns:csipaus="https://csipaus.org/ns">
    <modesSupported>00500088</modesSupported>
    <csipaus:doeModesSupported>0000000F</csipaus:doeModesSupported>
    <type>1</type>
    <rtgMaxVA>
        <multiplier>3</multiplier>
        <value>52.5</value>
    </rtgMaxVA>
    <rtgMaxW>
        <multiplier>3</multiplier>
        <value>50</value>
    </rtgMaxW>
    <rtgMaxVar>
        <multiplier>3</multiplier>
        <value>2.5</value>
    </rtgMaxVar>
    <rtgMaxVarNeg>
        <multiplier>3</multiplier>
        <value>-2.5</value>
    </rtgMaxVarNeg>
    <rtgMinPFOverExcited>
        <displacement>900</displacement>
        <multiplier>-3</multiplier>
    </rtgMinPFOverExcited>
    <rtgMinPFUnderExcited>
        <displacement>900</displacement>
        <multiplier>-3</multiplier>
    </rtgMinPFUnderExcited>
    <rtgVNom>
        <multiplier>0</multiplier>
        <value>230</value>
    </rtgVNom>
</DERCapability>`);
});

it('should generate DERCapability XML without optional fields', () => {
    const response = generateDerCapability({
        modesSupported:
            DERControlType.opModEnergize |
            DERControlType.opModFixedW |
            DERControlType.opModMaxLimW |
            DERControlType.opModTargetW,
        doeModesSupported:
            DOEControlType.opModExpLimW |
            DOEControlType.opModGenLimW |
            DOEControlType.opModImpLimW |
            DOEControlType.opModLoadLimW,
        type: DERType.VirtualOrMixedDER,
        rtgMaxVA: {
            multiplier: 3,
            value: 52.5,
        },
        rtgMaxW: {
            multiplier: 3,
            value: 50,
        },
        rtgMaxVar: {
            multiplier: 3,
            value: 2.5,
        },
    });

    const xml = objectToXml(response);

    expect(xml).toBe(`<?xml version="1.0"?>
<DERCapability xmlns="urn:ieee:std:2030.5:ns" xmlns:csipaus="https://csipaus.org/ns">
    <modesSupported>00500088</modesSupported>
    <csipaus:doeModesSupported>0000000F</csipaus:doeModesSupported>
    <type>1</type>
    <rtgMaxVA>
        <multiplier>3</multiplier>
        <value>52.5</value>
    </rtgMaxVA>
    <rtgMaxW>
        <multiplier>3</multiplier>
        <value>50</value>
    </rtgMaxW>
    <rtgMaxVar>
        <multiplier>3</multiplier>
        <value>2.5</value>
    </rtgMaxVar>
</DERCapability>`);
});

it('should generate XSD-valid DERCapability XML', () => {
    const response = generateDerCapability({
        modesSupported:
            DERControlType.opModEnergize |
            DERControlType.opModFixedW |
            DERControlType.opModMaxLimW |
            DERControlType.opModTargetW,
        doeModesSupported:
            DOEControlType.opModExpLimW |
            DOEControlType.opModGenLimW |
            DOEControlType.opModImpLimW |
            DOEControlType.opModLoadLimW,
        type: DERType.VirtualOrMixedDER,
        rtgMaxVA: {
            multiplier: 3,
            value: 52.5,
        },
        rtgMaxW: {
            multiplier: 3,
            value: 50,
        },
        rtgMaxVar: {
            multiplier: 3,
            value: 2.5,
        },
    });

    const xml = objectToXml(response);
    const validation = validateXml(xml);

    expect(validation.valid).toBe(true);
});
