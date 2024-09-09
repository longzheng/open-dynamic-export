import { it, expect } from 'vitest';
import { RoleFlagsType } from './roleFlagsType.js';
import { numberToHex } from '../../helpers/number.js';

it('site is 3 hex', () => {
    const value =
        RoleFlagsType.isMirror | RoleFlagsType.isPremisesAggregationPoint;

    const hex = numberToHex(value);

    expect(hex).toBe('3');
});

it('DER is 49 hex', () => {
    const value =
        RoleFlagsType.isMirror | RoleFlagsType.isDER | RoleFlagsType.isSubmeter;

    const hex = numberToHex(value);

    expect(hex).toBe('49');
});
