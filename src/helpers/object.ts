type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const objectEntriesWithType = <T extends object>(obj: T) =>
    Object.entries(obj) as Entries<T>;

// https://stackoverflow.com/a/76176570/311809
export const objectFromEntriesWithType = <
    const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(
    entries: T,
): { [K in T[number] as K[0]]: K[1] } => {
    return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
};
