import { Builder } from 'xml2js';

export function convertToXml(object: Record<string, unknown>): string {
    const builder = new Builder({
        xmldec: undefined,
        renderOpts: { pretty: true, indent: '    ' },
    });
    return builder.buildObject(object);
}
