export async function withAbortCheck<T>({
    signal,
    fn,
}: {
    signal: AbortSignal;
    fn: () => Promise<T>;
}): Promise<T> {
    if (signal.aborted) {
        throw new Error('Operation was aborted');
    }
    return await fn();
}
