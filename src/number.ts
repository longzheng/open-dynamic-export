export function safeParseIntString(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Value "${value}" is not a valid number`);
    }
    return parsed;
}
