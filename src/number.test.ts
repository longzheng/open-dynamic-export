import { describe, expect, it } from 'vitest';
import { numberWithPow10 } from './number';

describe('numberWithPow10', () => {
    it('should calculate positive power of ten', () => {
        const result = numberWithPow10(1, 2);
        expect(result).toBe(100);
    });

    it('should calculate negative power of ten', () => {
        const result = numberWithPow10(1005, -1);
        expect(result).toBe(100.5);
    });

    it('should calculate zero power of ten', () => {
        const result = numberWithPow10(1000, 0);
        expect(result).toBe(1000);
    });
});
