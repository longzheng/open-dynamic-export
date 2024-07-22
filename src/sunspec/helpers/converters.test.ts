import { expect, it } from 'vitest';
import {
    registersToAcc32,
    registersToAcc64BigInt,
    registersToInt16,
    registersToString,
    registersToSunssf,
    registersToUint16,
    registersToUint32,
} from './converters';

it('registersToUint32 should convert registers to a 32-bit unsigned integer', () => {
    const registers = [0x1234, 0x5678];
    const result = registersToUint32(registers);
    expect(result).toBe(305419896);
});

it('registersToString should convert registers to a string', () => {
    const registers = [0x4672, 0x6f6e, 0x6975, 0x7300];
    const result = registersToString(registers);
    expect(result).toBe('Fronius');
});

it('registersToUint16 should convert registers to a 16-bit unsigned integer', () => {
    const registers = [0x1234];
    const result = registersToUint16(registers);
    expect(result).toBe(4660);
});

it('registersToInt16 should convert registers to a 16-bit signed integer', () => {
    const registers = [0x8001];
    const result = registersToInt16(registers);
    expect(result).toBe(-32767);
});

it('registersToSunssf should convert registers to a 16-bit signed integer', () => {
    const registers = [0x8001];
    const result = registersToSunssf(registers);
    expect(result).toBe(-32767);
});

it('registersToAcc32 should convert registers to a 32 bit accumulator', () => {
    const registers = [0x0001, 0x0001];
    const result = registersToAcc32(registers);
    expect(result).toBe(65537);
});

it('registersToAcc64 should convert registers to a 64 bit accumulator', () => {
    const registers = [0x0001, 0x0001, 0x0001, 0x0001];
    const result = registersToAcc64BigInt(registers);
    expect(result).toBe(281479271743489n);
});
