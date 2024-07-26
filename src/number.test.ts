import { describe, expect, it } from 'vitest';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    numberWithPow10,
    sumNumbersArray,
    sumNumbersNullableArray,
} from './number';

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

    it('should calculate number without floating point error', () => {
        const result = numberWithPow10(355, -2);
        expect(result).toBe(3.55);
    });
});

describe('sumNumbersArray', () => {
    it('should sum numbers', () => {
        const result = sumNumbersArray([1, 2, 3]);
        expect(result).toBe(6);
    });

    it('should avoid floating point errors', () => {
        const result = sumNumbersArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.6);
    });
});

describe('sumNumbersNullableArray', () => {
    it('should return null if any number is null', () => {
        const result = sumNumbersNullableArray([1, null, 3]);
        expect(result).toBe(null);
    });

    it('should avoid floating point errors', () => {
        const result = sumNumbersNullableArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.6);
    });
});

describe('averageNumbersArray', () => {
    it('should average numbers', () => {
        const result = averageNumbersArray([1, 2, 3]);
        expect(result).toBe(2);
    });

    it('should avoid floating point errors', () => {
        const result = averageNumbersArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.2);
    });
});

describe('averageNumbersNullableArray', () => {
    it('should return null if any number is null', () => {
        const result = averageNumbersNullableArray([1, null, 3]);
        expect(result).toBe(null);
    });

    it('should avoid floating point errors', () => {
        const result = averageNumbersNullableArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.2);
    });
});
