import { describe, it, expect } from 'vitest';
import { cappedChange } from './math.js';

describe('cappedChange', () => {
    it('should return the target value if the previous value is the same as the target value', () => {
        const result = cappedChange({
            previousValue: 100,
            targetValue: 100,
            maxChange: 10,
        });
        expect(result).toBe(100);
    });

    it('should increase the previous value by maxChange if the target value is greater and the difference is more than maxChange', () => {
        const result = cappedChange({
            previousValue: 100,
            targetValue: 150,
            maxChange: 10,
        });
        expect(result).toBe(110);
    });

    it('should decrease the previous value by maxChange if the target value is less and the difference is more than maxChange', () => {
        const result = cappedChange({
            previousValue: 100,
            targetValue: 50,
            maxChange: 10,
        });
        expect(result).toBe(90);
    });

    it('should increase the previous value to the target value if the difference is less than maxChange', () => {
        const result = cappedChange({
            previousValue: 100,
            targetValue: 105,
            maxChange: 10,
        });
        expect(result).toBe(105);
    });

    it('should decrease the previous value to the target value if the difference is less than maxChange', () => {
        const result = cappedChange({
            previousValue: 100,
            targetValue: 95,
            maxChange: 10,
        });
        expect(result).toBe(95);
    });

    it('should handle negative values correctly', () => {
        const result = cappedChange({
            previousValue: -100,
            targetValue: -50,
            maxChange: 10,
        });
        expect(result).toBe(-90);
    });

    it('should handle a maxChange of zero correctly', () => {
        const result = cappedChange({
            previousValue: 100,
            targetValue: 150,
            maxChange: 0,
        });
        expect(result).toBe(100);
    });
});
