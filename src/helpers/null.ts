export function assertNonNull<T>(value: T | null): T {
    if (value === null) {
        throw new Error('Non-null value expected');
    }
    return value;
}
