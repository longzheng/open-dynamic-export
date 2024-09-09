import { it, expect } from 'vitest';
import { numberToHex } from '../../helpers/number.js';
import { DERControlType } from './derControlType.js';

it('value is expected', () => {
    const value =
        DERControlType.opModEnergize |
        DERControlType.opModFixedW |
        DERControlType.opModMaxLimW |
        DERControlType.opModTargetW;

    const hex = numberToHex(value).padStart(8, '0');

    expect(hex).toBe('00500088');
});
