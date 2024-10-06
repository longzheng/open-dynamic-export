import { it, expect } from 'vitest';
import { objectToXml } from '../helpers/xml.js';
import { DERControlType } from './derControlType.js';
import { generateDerSettingsResponse } from './derSettings.js';
import { DOEControlType } from './doeModesSupportedType.js';

it('should generate DERSettings XML', () => {
    const response = generateDerSettingsResponse({
        updatedTime: new Date(1682475029 * 1000),
        modesEnabled:
            DERControlType.opModEnergize |
            DERControlType.opModFixedW |
            DERControlType.opModMaxLimW |
            DERControlType.opModTargetW,
        doeModesEnabled:
            DOEControlType.opModExpLimW |
            DOEControlType.opModGenLimW |
            DOEControlType.opModImpLimW |
            DOEControlType.opModLoadLimW,
        setGradW: 1,
        setMaxVA: {
            multiplier: 3,
            value: 52.5,
        },
        setMaxW: {
            multiplier: 3,
            value: 50,
        },
        setMaxVar: {
            multiplier: 3,
            value: 2.5,
        },
    });

    const xml = objectToXml(response);

    expect(xml).toBe(`<?xml version="1.0"?>
<DERSettings xmlns="urn:ieee:std:2030.5:ns" xmlns:csipaus="https://csipaus.org/ns">
    <updatedTime>1682475029</updatedTime>
    <modesEnabled>00500088</modesEnabled>
    <csipaus:doeModesEnabled>0000000F</csipaus:doeModesEnabled>
    <setGradW>1</setGradW>
    <setMaxW>
        <multiplier>3</multiplier>
        <value>50</value>
    </setMaxW>
    <setMaxVA>
        <multiplier>3</multiplier>
        <value>52.5</value>
    </setMaxVA>
    <setMaxVar>
        <multiplier>3</multiplier>
        <value>2.5</value>
    </setMaxVar>
</DERSettings>`);
});
