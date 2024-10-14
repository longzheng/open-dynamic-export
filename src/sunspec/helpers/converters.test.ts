import { describe, expect, it } from 'vitest';
import {
    int16NullableToRegisters,
    int16ToRegisters,
    registersToAcc32,
    registersToAcc64BigInt,
    registersToId,
    registersToInt16,
    registersToInt16Nullable,
    registersToInt32,
    registersToInt32Nullable,
    registersToString,
    registersToStringNullable,
    registersToSunssf,
    registersToUint16,
    registersToUint16Nullable,
    registersToUint32,
    registersToUint32Nullable,
    uint16NullableToRegisters,
    uint16ToRegisters,
} from './converters.js';

describe('registersToUint32', () => {
    it('should convert integer', () => {
        const registers = [0x1234, 0xabcd];
        const result = registersToUint32(registers);
        expect(result).toBe(305441741);
    });

    it('should convert maximum integer', () => {
        const registers = [0xffff, 0xfffe];
        const result = registersToUint32(registers);
        expect(result).toBe(4294967294);
    });

    it('should convert zero', () => {
        const registers = [0x0000, 0x0000];
        const result = registersToUint32(registers);
        expect(result).toBe(0);
    });
});

describe('registersToUint32Nullable', () => {
    it('should convert null', () => {
        const registers = [0xffff, 0xffff];
        const result = registersToUint32Nullable(registers);
        expect(result).toBe(null);
    });
});

describe('registersToInt32', () => {
    it('should convert positive integer', () => {
        const registers = [0x0001, 0x0000];
        const result = registersToInt32(registers);
        expect(result).toBe(65536);
    });

    it('should convert negative integer', () => {
        const registers = [0xffff, 0x0000];
        const result = registersToInt32(registers);
        expect(result).toBe(-65536);
    });

    it('should convert maximum positive integer', () => {
        const registers = [0x7fff, 0xffff];
        const result = registersToInt32(registers);
        expect(result).toBe(2147483647);
    });

    it('should convert minimum negative integer', () => {
        const registers = [0x8000, 0x0000];
        const result = registersToInt32(registers);
        expect(result).toBe(-2147483648);
    });
});

describe('registersToInt32Nullable', () => {
    it('should convert null', () => {
        const registers = [0x8000, 0x0000];
        const result = registersToInt32Nullable(registers);
        expect(result).toBe(null);
    });
});

describe('registersToString', () => {
    it('should convert registers to a string', () => {
        const registers = [0x4672, 0x6f6e, 0x6975, 0x7300];
        const result = registersToString(registers);
        expect(result).toBe('Fronius');
    });

    it('should convert different size registers to a string', () => {
        const registers = [0x4672];
        const result = registersToString(registers);
        expect(result).toBe('Fr');
    });
});

describe('registersToString', () => {
    it('should convert all registers with 0x0000 to null', () => {
        const registers = [0x0000, 0x0000, 0x0000, 0x0000];
        const result = registersToStringNullable(registers);
        expect(result).toBe(null);
    });

    it('should convert some registers with 0x0000 to value', () => {
        const registers = [0x0000, 0x4600, 0x0000, 0x0000];
        const result = registersToStringNullable(registers);
        expect(result).toBe('F');
    });
});

it('registersToUint16 should convert registers to a 16-bit unsigned integer', () => {
    const registers = [0x1234];
    const result = registersToUint16(registers);
    expect(result).toBe(4660);
});

it('registersToUint16Nullable should convert registers to null', () => {
    const registers = [0xffff];
    const result = registersToUint16Nullable(registers);
    expect(result).toBe(null);
});

it('registersToInt16 should convert registers to a 16-bit signed integer', () => {
    const registers = [0x8001];
    const result = registersToInt16(registers);
    expect(result).toBe(-32767);
});

it('registersToInt16Nullable should convert null to a 16-bit signed integer', () => {
    const registers = [0x8000];
    const result = registersToInt16Nullable(registers);
    expect(result).toBe(null);
});

it('registersToSunssf should convert registers to a 16-bit signed integer', () => {
    const registers = [0x8001];
    const result = registersToSunssf(registers);
    expect(result).toBe(-32767);
});

describe('registersToAcc32', () => {
    it('convert registers to a 32 bit accumulator', () => {
        const registers = [0x0001, 0x0001];
        const result = registersToAcc32(registers);
        expect(result).toBe(65537);
    });

    it('maximum value', () => {
        const registers = [0xffff, 0xffff];
        const result = registersToAcc32(registers);
        expect(result).toBe(4294967295);
    });
});

describe('registersToAcc64', () => {
    it('should convert registers to a 64 bit accumulator', () => {
        const registers = [0x0001, 0x0001, 0x0001, 0x0001];
        const result = registersToAcc64BigInt(registers);
        expect(result).toBe(281479271743489n);
    });

    it('maximum value', () => {
        const registers = [0x7fff, 0xffff, 0xffff, 0xffff];
        const result = registersToAcc64BigInt(registers);
        expect(result).toBe(9223372036854775807n);
    });
});

it('uint16ToRegisters should convert a 16-bit unsigned integer to registers', () => {
    const value = 4660;
    const result = uint16ToRegisters(value);
    expect(result).toEqual([0x1234]);
});

it('uint16ToRegisters should convert null to registers', () => {
    const value = null;
    const result = uint16NullableToRegisters(value);
    expect(result).toEqual([0xffff]);
});

it('int16ToRegisters should convert a 16-bit signed integer to registers', () => {
    const value = -20;
    const result = int16ToRegisters(value);
    expect(result).toEqual([0xffec]);
});

it('int16ToRegistersNullable should convert null to registers', () => {
    const value = null;
    const result = int16NullableToRegisters(value);
    expect(result).toEqual([0x8000]);
});

describe('registersToId', () => {
    it('registersToId should convert register to a ID number', () => {
        const registers = [0x0002];
        const result = registersToId(registers, 2);
        expect(result).toBe(2);
    });

    it('registersToId should throw if register does not match ID number', () => {
        const registers = [0x0004];
        expect(() => registersToId(registers, 2)).toThrowError(
            'Invalid model ID value',
        );
    });

    it('registersToId should convert register to a ID number array', () => {
        const registers = [0x0003];
        const result = registersToId(registers, [2, 3, 4]);
        expect(result).toBe(3);
    });

    it('registersToId should throw if register does not match ID number array', () => {
        const registers = [0x0005];
        expect(() => registersToId(registers, [2, 3, 4])).toThrowError(
            'Invalid model ID value',
        );
    });
});
