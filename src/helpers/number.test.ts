import { describe, expect, it } from 'vitest';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    convertNumberToBaseAndPow10Exponent,
    mathMaxNullableArray,
    mathMinNullableArray,
    numberWithPow10,
    safeParseIntString,
    sumBigIntArray,
    sumNumbersArray,
    sumNumbersNullableArray,
} from './number.js';

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
    it('should return if any number is null', () => {
        const result = sumNumbersNullableArray([1, null, 3]);
        expect(result).toBe(4);
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
    it('should return if any number is null', () => {
        const result = averageNumbersNullableArray([1, null, 3]);
        expect(result).toBe(2);
    });

    it('should avoid floating point errors', () => {
        const result = averageNumbersNullableArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.2);
    });
});

describe('mathMinNullbleArray', () => {
    it('should return if any number is null', () => {
        const result = mathMinNullableArray([1, null, 3]);
        expect(result).toBe(1);
    });

    it('should return minimum value if all numbers are not null', () => {
        const result = mathMinNullableArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.1);
    });
});

describe('mathMaxNullableArray', () => {
    it('should return if any number is null', () => {
        const result = mathMaxNullableArray([1, null, 3]);
        expect(result).toBe(3);
    });

    it('should return maximum value if all numbers are not null', () => {
        const result = mathMaxNullableArray([0.1, 0.2, 0.3]);
        expect(result).toBe(0.3);
    });
});

describe('convertNumberToBaseAndPow10Exponent', () => {
    it('should convert number divisible by 10', () => {
        const result = convertNumberToBaseAndPow10Exponent(5000);
        expect(result).toEqual({ base: 5, pow10: 3 });
    });

    it('should not convert number not divisble by 10', () => {
        const result = convertNumberToBaseAndPow10Exponent(5123);
        expect(result).toEqual({ base: 5123, pow10: 0 });
    });

    it('should convert decimal number', () => {
        const result = convertNumberToBaseAndPow10Exponent(5.1);
        expect(result).toEqual({ base: 51, pow10: -1 });
    });

    it('should convert number divisible by 10 and decimal number', () => {
        const result = convertNumberToBaseAndPow10Exponent(50.1001);
        expect(result).toEqual({ base: 501001, pow10: -4 });
    });

    it('should convert number divisible by 10 and decimal number with trailing zeros', () => {
        // eslint-disable-next-line prettier/prettier
        const result = convertNumberToBaseAndPow10Exponent(50.100000);
        expect(result).toEqual({ base: 501, pow10: -1 });
    });

    it('should convert number 0', () => {
        const result = convertNumberToBaseAndPow10Exponent(0);
        expect(result).toEqual({ base: 0, pow10: 0 });
    });

    it('should convert number 0.0', () => {
        const result = convertNumberToBaseAndPow10Exponent(0.0);
        expect(result).toEqual({ base: 0, pow10: 0 });
    });
});

describe('sumBigIntArray', () => {
    it('should sum bigints', () => {
        const result = sumBigIntArray([BigInt(1), 2n, BigInt(3)]);
        expect(result).toBe(6n);
    });
});

describe('safeParseIntString', () => {
    it('should parse integer string', () => {
        const result = safeParseIntString('123');
        expect(result).toBe(123);
    });

    it('should parse negative integer string', () => {
        const result = safeParseIntString('-123');
        expect(result).toBe(-123);
    });
});
