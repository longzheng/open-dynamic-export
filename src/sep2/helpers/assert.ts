export function assertString(value: unknown): string {
    if (typeof value !== 'string') {
        throw new Error(`Expected string, got ${typeof value}`);
    }

    return value;
}

export function assertArray<T>(value: T) {
    // array can be empty
    if (value === undefined) {
        return [];
    }

    if (!Array.isArray(value)) {
        throw new Error(`Expected array, got ${typeof value}`);
    }

    return value as T[];
}
