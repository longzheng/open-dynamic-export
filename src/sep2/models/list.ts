import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';
import { z } from 'zod';

export const listSchema = z
    .object({
        all: z.number(),
        results: z.number(),
    })
    .merge(resourceSchema);

export type List = z.infer<typeof listSchema>;

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
