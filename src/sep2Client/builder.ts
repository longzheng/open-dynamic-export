import { Builder } from 'xml2js';

const builder = new Builder({
    xmldec: undefined,
    renderOpts: { pretty: true, indent: '    ' },
});

export function objectToXml(object: Record<string, unknown>): string {
    return builder.buildObject(object);
}
