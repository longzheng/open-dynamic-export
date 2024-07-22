export function registersToString(registers: number[]): string {
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

export function registersToUint32(registers: number[]) {
    if (registers.length !== 2) {
        throw new Error('Invalid register length');
    }

    return (registers[0]! << 16) | registers[1]!;
}

export function registersToUint16(registers: number[]) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    return registers[0]!;
}

export function uint16ToRegisters(value: number): number[] {
    if (value < 0 || value > 0xffff) {
        throw new Error('Value out of range for uint16');
    }

    return [value];
}

export function registersToInt16(registers: number[]) {
    if (registers.length !== 1) {
        throw new Error('Invalid register length');
    }

    return (registers[0]! << 16) >> 16;
}

export function int16ToRegisters(value: number): number[] {
    if (value < -32768 || value > 32767) {
        throw new Error('Value out of range for int16');
    }

    // Ensure the value is treated as a 16-bit signed integer
    return [value & 0xffff];
}

export function registersToSunssf(registers: number[]) {
    return registersToInt16(registers);
}

export function registersToAcc32(registers: number[]) {
    if (registers.length !== 2) {
        throw new Error('Invalid register length');
    }

    return (registers[0]! << 16) + registers[1]!;
}

export function registersToAcc64BigInt(registers: number[]): bigint {
    if (registers.length !== 4) {
        throw new Error('Invalid register length');
    }

    return (
        (BigInt(registers[0]!) << 48n) +
        (BigInt(registers[1]!) << 32n) +
        (BigInt(registers[2]!) << 16n) +
        BigInt(registers[3]!)
    );
}
