import { Builder } from 'xml2js';

const builder = new Builder({
    xmldec: undefined,
    renderOpts: { pretty: true, indent: '    ' },
});

function stripUndefinedValues(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
        return undefined;
    }

    if (Array.isArray(obj)) {
        return obj
            .map(stripUndefinedValues)
            .filter((item) => item !== undefined);
    }

    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            const processedValue = stripUndefinedValues(value);
            if (processedValue !== undefined) {
                result[key] = processedValue;
            }
        }
        return result;
    }

    return obj;
}

export function objectToXml(object: Record<string, unknown>): string {
    const cleanedObject = stripUndefinedValues(object);
    return builder.buildObject(cleanedObject);
}
