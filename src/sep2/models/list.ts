import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';

export const listSchema = v.intersect([
    v.object({
        all: v.number(),
        results: v.number(),
    }),
    resourceSchema,
]);

export type List = v.InferOutput<typeof listSchema>;

export function parseListXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): List {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const all = safeParseIntString(assertString(xmlObject['$']['all']));
    const results = safeParseIntString(assertString(xmlObject['$']['results']));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        all,
        results,
    };
}
