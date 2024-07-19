import { it, expect } from 'vitest';
import { objectToXml } from './builder';
import { DERControlType } from './derControlType';
import { generateDerSettingsResponse } from './derSettings';

it('should generate DERSettings XML', () => {
    const response = generateDerSettingsResponse({
        updatedTime: new Date(1682475029 * 1000),
        modesEnabled:
            DERControlType.opModEnergize |
            DERControlType.opModFixedW |
            DERControlType.opModMaxLimW |
            DERControlType.opModTargetW,
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
<DERSettings xmlns="urn:ieee:std:2030.5:ns">
    <updatedTime>1682475029</updatedTime>
    <modesEnabled>00500088</modesEnabled>
    <setGradW>1</setGradW>
    <setMaxVA>
        <multiplier>3</multiplier>
        <value>52.5</value>
    </setMaxVA>
    <setMaxW>
        <multiplier>3</multiplier>
        <value>50</value>
    </setMaxW>
    <setMaxVar>
        <multiplier>3</multiplier>
        <value>2.5</value>
    </setMaxVar>
</DERSettings>`);
});
