import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { linkSchema, parseLinkXmlObject } from './link.js';

export const listLinkSchema = v.intersect([
    v.object({
        all: v.optional(v.number()),
    }),
    linkSchema,
]);

export type ListLink = v.InferOutput<typeof listLinkSchema>;
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseListLinkXmlObject(xmlObject: any): ListLink {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const link = parseLinkXmlObject(xmlObject);
    const all = xmlObject['$']['all']
        ? safeParseIntString(assertString(xmlObject['$']['all']))
        : undefined;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...link,
        all,
    };
}
