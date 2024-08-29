export const promiseAllObject = async <
    T extends Record<string, Promise<unknown>>,
>(
    promises: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> => {
    const entries = Object.entries(promises);
    const results = await Promise.all(entries.map(([, promise]) => promise));

    return Object.fromEntries(
        entries.map(([key], index) => [key, results[index]]),
    ) as { [K in keyof T]: Awaited<T[K]> };
};
