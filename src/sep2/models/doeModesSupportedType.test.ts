import { it, expect } from 'vitest';
import { numberToHex } from '../../helpers/number.js';
import { DOEControlType } from './doeModesSupportedType.js';

it('value is expected', () => {
    const value =
        DOEControlType.opModExpLimW |
        DOEControlType.opModGenLimW |
        DOEControlType.opModImpLimW |
        DOEControlType.opModLoadLimW;

    const hex = numberToHex(value).padStart(8, '0');

    expect(hex).toBe('0000000F');
});
