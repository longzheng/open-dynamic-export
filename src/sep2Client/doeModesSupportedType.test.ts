import { it, expect } from 'vitest';
import { convertToHex } from '../number';
import { DOEModesSupportedType } from './doeModesSupportedType';

it('value is expected', () => {
    const value =
        DOEModesSupportedType.opModExpLimW |
        DOEModesSupportedType.opModGenLimW |
        DOEModesSupportedType.opModImpLimW |
        DOEModesSupportedType.opModLoadLimW;

    const hex = convertToHex(value).padStart(8, '0');

    expect(hex).toBe('0000000F');
});
