type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const objectEntriesWithType = <T extends object>(obj: T) =>
    Object.entries(obj) as Entries<T>;
