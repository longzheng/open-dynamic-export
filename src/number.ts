export function safeParseIntString(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Value "${value}" is not a valid number`);
    }
    return parsed;
}

export function safeParseHexString(value: string): number {
    const parsed = parseInt(value, 16);
    if (isNaN(parsed)) {
        throw new Error(`Value "${value}" is not a valid hex`);
    }
    return parsed;
}

export function convertToHex(value: number): string {
    return value.toString(16).toUpperCase();
}
