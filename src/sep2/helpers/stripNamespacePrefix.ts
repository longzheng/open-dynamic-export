// the server might send XML namespace with a different prefix
// strip the prefix from all the property keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripNamespacePrefix(obj: any): any {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return obj;
    }

    return Object.fromEntries(
        Object.entries(obj as object).map(([key, value]) => {
            const strippedKey = key.includes(':')
                ? (key.split(':').pop() as string)
                : key;
            return [strippedKey, value];
        }),
    );
}
