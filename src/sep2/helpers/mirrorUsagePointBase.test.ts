import { describe, expect, it } from 'vitest';
import {
    getReadingTimePeriod,
    scaleReadingValueToInt16,
} from './mirrorUsagePointBase.js';

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

    it('should throw for non-finite reading values', () => {
        expect(() =>
            scaleReadingValueToInt16({
                value: Number.POSITIVE_INFINITY,
                powerOfTenMultiplier: 0,
            }),
        ).toThrow('Reading value must be a finite number');
    });

    it('should throw for non-finite multipliers', () => {
        expect(() =>
            scaleReadingValueToInt16({
                value: 123,
                powerOfTenMultiplier: Number.NaN,
            }),
        ).toThrow('powerOfTenMultiplier must be a finite number');
    });
});

describe('getReadingTimePeriod', () => {
    it('should report the completed interval, not the current one', () => {
        expect(
            getReadingTimePeriod({
                samples: [
                    { date: new Date('2024-01-01T00:00:10Z') },
                    { date: new Date('2024-01-01T00:00:50Z') },
                ],
                currentIntervalStart: new Date('2024-01-01T00:01:00Z'),
                intervalSeconds: 60,
            }),
        ).toStrictEqual({
            start: new Date('2024-01-01T00:00:00Z'),
            duration: 60,
        });
    });

    it('should cover the whole span when catching up on multiple intervals', () => {
        expect(
            getReadingTimePeriod({
                samples: [
                    { date: new Date('2024-01-01T00:00:30Z') },
                    { date: new Date('2024-01-01T00:02:30Z') },
                ],
                currentIntervalStart: new Date('2024-01-01T00:03:00Z'),
                intervalSeconds: 60,
            }),
        ).toStrictEqual({
            start: new Date('2024-01-01T00:00:00Z'),
            duration: 180,
        });
    });

    it('should align the start to the interval tick', () => {
        expect(
            getReadingTimePeriod({
                samples: [{ date: new Date('2024-01-01T00:07:23Z') }],
                currentIntervalStart: new Date('2024-01-01T00:10:00Z'),
                intervalSeconds: 300,
            }),
        ).toStrictEqual({
            start: new Date('2024-01-01T00:05:00Z'),
            duration: 300,
        });
    });
});
