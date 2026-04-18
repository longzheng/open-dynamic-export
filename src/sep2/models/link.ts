import * as v from 'valibot';
import { assertString } from '../helpers/assert.js';

export const linkSchema = v.object({
    href: v.string(),
});

export type Link = v.InferOutput<typeof linkSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseLinkXmlObject(xmlObject: any): Link {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const linkHref = assertString(xmlObject['$']['href']);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        href: linkHref,
    };
}
