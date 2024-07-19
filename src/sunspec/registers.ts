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
