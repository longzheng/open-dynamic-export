export function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
        throw new Error(`Expected string, got ${typeof value}`);
    }
}

export function assertIsNumber(value: unknown): asserts value is number {
    if (typeof value !== 'number') {
        throw new Error(`Expected number, got ${typeof value}`);
    }
}
