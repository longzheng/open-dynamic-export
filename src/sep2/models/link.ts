import { assertString } from '../helpers/assert.js';
import { z } from 'zod';

export const linkSchema = z.object({
    href: z.string(),
});

export type Link = z.infer<typeof linkSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseLinkXmlObject(xmlObject: any): Link {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const linkHref = assertString(xmlObject['$']['href']);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        href: linkHref,
    };
}
