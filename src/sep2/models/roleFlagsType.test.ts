import { it, expect } from 'vitest';
import type { RoleFlagsTypeObject } from './roleFlagsType';
import { mapEnumNumberToRoleFlagsObject, RoleFlagsType } from './roleFlagsType';
import { numberToHex } from '../../number';

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

it('map to object', () => {
    const object = mapEnumNumberToRoleFlagsObject(
        RoleFlagsType.isMirror | RoleFlagsType.isDER | RoleFlagsType.isSubmeter,
    );

    expect(object).toStrictEqual({
        isMirror: true,
        isPremisesAggregationPoint: false,
        isPEV: false,
        isDER: true,
        isRevenueQuality: false,
        isDC: false,
        isSubmeter: true,
    } as RoleFlagsTypeObject);
});
