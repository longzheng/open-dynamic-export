import * as v from 'valibot';
import { assertString } from '../helpers/assert.js';

export const resourceSchema = v.object({
    href: v.optional(v.string()),
});

export type Resource = v.InferOutput<typeof resourceSchema>;

export function parseResourceXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): Resource {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const href = xmlObject['$']['href']
        ? assertString(xmlObject['$']['href'])
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        href,
    };
}
