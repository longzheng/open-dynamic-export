import { numberWithPow10 } from '../../../helpers/number.js';

export function registersToString(registers: number[]) {
    const buffer = Buffer.from(
        registers.flatMap((register) => [
            (register >> 8) & 0xff,
            register & 0xff,
        ]),
    );
    return (
        buffer
            .toString('utf-8')
            // trim any extra null characters (\x00)
            .replace(/\0/g, '')
    );
}

export function registersToStringNullable(registers: number[]) {
    if (registers.every((register) => register === 0)) {
        return null;
    }

    return registersToString(registers);
}

export function registersToUint32(registers: number[], pow10: number = 0) {
    if (registers.length !== 2) {
        throw new Error(
            `registersToUint32 invalid register length, should be 2, is ${registers.length}`,
        );
    }

    const value = ((registers[0]! << 16) | (registers[1]! & 0xffff)) >>> 0;

    if (pow10 === 0) {
        return value;
    }

    return numberWithPow10(value, pow10);
}

export function registersToUint32Nullable(
    registers: number[],
    decimal: number = 0,
) {
    if (registers.every((register) => register === 0xffff)) {
        return null;
    }

    return registersToUint32(registers, decimal);
}

export function uint32ToRegisters(value: number, pow10: number = 0): number[] {
    if (value < 0 || value > 0xffffffff) {
        throw new Error('Value out of range for uint32');
    }

    const scaledValue = pow10 === 0 ? value : numberWithPow10(value, pow10);

    return [(scaledValue >> 16) & 0xffff, scaledValue & 0xffff];
}

export function uint32NullableToRegisters(
    value: number | null,
    pow10: number = 0,
): number[] {
    if (value === null) {
        return [0xffff, 0xffff];
    }

    return uint32ToRegisters(value, pow10);
}

export function registersToInt32(registers: number[], pow10: number = 0) {
    if (registers.length !== 2) {
        throw new Error(
            `registersToUint32 invalid register length, should be 2, is ${registers.length}`,
        );
    }

    const value = (registers[0]! << 16) | (registers[1]! & 0xffff);

    if (pow10 === 0) {
        return value;
    }

    return numberWithPow10(value, pow10);
}

export function registersToInt32Nullable(
    registers: number[],
    pow10: number = 0,
) {
    if (
        registers.length === 2 &&
        registers[0] === 0x8000 &&
        registers[1] === 0x0000
    ) {
        return null;
    }

    return registersToInt32(registers, pow10);
}

export function registersToUint16(registers: number[], pow10: number = 0) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    const value = registers[0]! & 0xffff;

    if (pow10 === 0) {
        return value;
    }

    return numberWithPow10(value, pow10);
}

export function registersToUint16Nullable(
    registers: number[],
    pow10: number = 0,
) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    if (registers[0] === 0xffff) {
        return null;
    }

    return registersToUint16(registers, pow10);
}

export function uint16ToRegisters(value: number): number[] {
    if (value < 0 || value > 0xffff) {
        throw new Error('Value out of range for uint16');
    }

    return [value];
}

export function uint16NullableToRegisters(value: number | null): number[] {
    if (value === null) {
        return [0xffff];
    }

    return uint16ToRegisters(value);
}

export function registersToInt16(registers: number[], pow10: number = 0) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    const value = (registers[0]! << 16) >> 16;

    if (pow10 === 0) {
        return value;
    }

    return numberWithPow10(value, pow10);
}

export function registersToInt16Nullable(
    registers: number[],
    pow10: number = 0,
) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    if (registers[0] === 0x8000) {
        return null;
    }

    return registersToInt16(registers, pow10);
}

export function int16ToRegisters(value: number, pow10: number = 0): number[] {
    if (value < -32768 || value > 32767) {
        throw new Error('Value out of range for int16');
    }

    const scaledValue = pow10 === 0 ? value : numberWithPow10(value, pow10);

    // Ensure the value is treated as a 16-bit signed integer
    return [scaledValue & 0xffff];
}

export function int16NullableToRegisters(
    value: number | null,
    pow10: number = 0,
): number[] {
    if (value === null) {
        return [0x8000];
    }

    // Ensure the value is treated as a 16-bit signed integer
    return int16ToRegisters(value, pow10);
}

export function registersToSunssf(registers: number[]) {
    return registersToInt16(registers);
}

export function registersToSunssfNullable(registers: number[]) {
    return registersToInt16Nullable(registers);
}

export function registersToAcc32(registers: number[]) {
    if (registers.length !== 2) {
        throw new Error('Invalid register length');
    }

    return ((registers[0]! << 16) + (registers[1]! & 0xffff)) >>> 0;
}

export function registersToAcc32Nullable(registers: number[]) {
    if (registers.every((register) => register === 0xffff)) {
        return null;
    }
    return registersToAcc32(registers);
}

export function registersToAcc64BigInt(registers: number[]): bigint {
    if (registers.length !== 4) {
        throw new Error('Invalid register length');
    }

    return (
        (BigInt(registers[0]!) << 48n) +
        (BigInt(registers[1]!) << 32n) +
        (BigInt(registers[2]!) << 16n) +
        BigInt(registers[3]! & 0xffff)
    );
}

export function registersToId<ID extends number>(
    registers: number[],
    value: ID | ID[],
): ID {
    const registerValue = registersToUint16(registers);

    if (typeof value === 'number') {
        if (registerValue !== value) {
            throw new Error(
                `Invalid model ID value, expected ${value}, got ${registerValue}`,
            );
        }
        return value;
    }

    if (value.some((v) => v === registerValue)) {
        return registerValue as ID;
    }

    throw new Error(
        `Invalid model ID value, expected one of ${value.join('/')}, got ${registerValue}`,
    );
}

export function registersToUint64(registers: number[]): bigint {
    if (registers.length !== 4) {
        throw new Error(
            `registersToUint64 invalid register length, should be 4, is ${registers.length}`,
        );
    }

    const value =
        (BigInt(registers[0]!) << 48n) |
        (BigInt(registers[1]!) << 32n) |
        (BigInt(registers[2]!) << 16n) |
        BigInt(registers[3]!);

    return value;
}

export function registersToUint64Nullable(registers: number[]) {
    if (registers.every((register) => register === 0xffff)) {
        return null;
    }

    return registersToUint64(registers);
}

export function registersToFloat32(registers: number[]): number {
    if (registers.length !== 2) {
        throw new Error('Invalid register length, should be 2');
    }

    // Ensure only the lower 16 bits are used for each register
    const high = registers[0]! & 0xffff;
    const low = registers[1]! & 0xffff;

    const buffer = Buffer.alloc(4);
    buffer.writeUInt16BE(high, 0);
    buffer.writeUInt16BE(low, 2);

    return buffer.readFloatBE(0);
}

export function registersToBitfield32(registers: number[]): number {
    if (registers.length !== 2) {
        throw new Error('Invalid register length, should be 2');
    }

    // Combine two 16-bit registers into a 32-bit integer
    return (registers[0]! << 16) | (registers[1]! & 0xffff);
}
