import { it, expect } from 'vitest';
import { convertToHex } from '../number';
import { DERControlType } from './derControlType';

it('value is expected', () => {
    const value =
        DERControlType.opModEnergize |
        DERControlType.opModFixedW |
        DERControlType.opModMaxLimW |
        DERControlType.opModTargetW;

    const hex = convertToHex(value).padStart(8, '0');

    expect(hex).toBe('00500088');
});
