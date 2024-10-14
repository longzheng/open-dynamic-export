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

export function registersToUint32(registers: number[]) {
    if (registers.length !== 2) {
        throw new Error(
            `registersToUint32 invalid register length, should be 2, is ${registers.length}`,
        );
    }

    return ((registers[0]! << 16) | (registers[1]! & 0xffff)) >>> 0;
}

export function registersToUint32Nullable(registers: number[]) {
    if (registers.every((register) => register === 0xffff)) {
        return null;
    }

    return registersToUint32(registers);
}

export function registersToInt32(registers: number[]) {
    if (registers.length !== 2) {
        throw new Error(
            `registersToUint32 invalid register length, should be 2, is ${registers.length}`,
        );
    }

    return (registers[0]! << 16) | (registers[1]! & 0xffff);
}

export function registersToInt32Nullable(registers: number[]) {
    if (
        registers.length === 2 &&
        registers[0] === 0x8000 &&
        registers[1] === 0x0000
    ) {
        return null;
    }

    return registersToInt32(registers);
}

export function registersToUint16(registers: number[]) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    return registers[0]! & 0xffff;
}

export function registersToUint16Nullable(registers: number[]) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    if (registers[0] === 0xffff) {
        return null;
    }

    return registersToUint16(registers);
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

export function registersToInt16(registers: number[]) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    return (registers[0]! << 16) >> 16;
}

export function registersToInt16Nullable(registers: number[]) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    if (registers[0] === 0x8000) {
        return null;
    }

    return registersToInt16(registers);
}

export function int16ToRegisters(value: number): number[] {
    if (value < -32768 || value > 32767) {
        throw new Error('Value out of range for int16');
    }

    // Ensure the value is treated as a 16-bit signed integer
    return [value & 0xffff];
}

export function int16NullableToRegisters(value: number | null): number[] {
    if (value === null) {
        return [0x8000];
    }

    // Ensure the value is treated as a 16-bit signed integer
    return [value & 0xffff];
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
