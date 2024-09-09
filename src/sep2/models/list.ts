import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, type Resource } from './resource.js';

export type List = {
    all: number;
    results: number;
} & Resource;

export function parseListXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): List {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const resource = parseResourceXmlObject(xmlObject);
    const all = safeParseIntString(assertString(xmlObject['$']['all']));
    const results = safeParseIntString(assertString(xmlObject['$']['results']));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        ...resource,
        all,
        results,
    };
}
