import { describe, expect, it } from 'vitest';
import { scaleReadingValueToInt16 } from './mirrorUsagePointBase.js';

describe('scaleReadingValueToInt16', () => {
    it('should keep values already within Int16 range unchanged', () => {
        expect(
            scaleReadingValueToInt16({
                value: 32767,
                powerOfTenMultiplier: 0,
            }),
        ).toStrictEqual({
            value: 32767,
            powerOfTenMultiplier: 0,
        });
    });

    it('should increase the multiplier for positive values outside Int16 range', () => {
        expect(
            scaleReadingValueToInt16({
                value: 45678,
                powerOfTenMultiplier: 0,
            }),
        ).toStrictEqual({
            value: 4568,
            powerOfTenMultiplier: 1,
        });
    });

    it('should increase the multiplier for negative values outside Int16 range', () => {
        expect(
            scaleReadingValueToInt16({
                value: -456789,
                powerOfTenMultiplier: 0,
            }),
        ).toStrictEqual({
            value: -4568,
            powerOfTenMultiplier: 2,
        });
    });

    it('should respect an existing multiplier when it already fits', () => {
        expect(
            scaleReadingValueToInt16({
                value: 45678,
                powerOfTenMultiplier: 1,
            }),
        ).toStrictEqual({
            value: 4568,
            powerOfTenMultiplier: 1,
        });
    });
});
