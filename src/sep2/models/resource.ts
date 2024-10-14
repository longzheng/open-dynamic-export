import { assertString } from '../helpers/assert.js';
import { z } from 'zod';

export const resourceSchema = z.object({
    href: z.string().optional(),
});

export type Resource = z.infer<typeof resourceSchema>;

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
