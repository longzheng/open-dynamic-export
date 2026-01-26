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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseListLinkXmlObject(xmlObject: any): ListLink {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const link = parseLinkXmlObject(xmlObject);
    const all = xmlObject['$']['all']
        ? safeParseIntString(assertString(xmlObject['$']['all']))
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...link,
        all,
    };
}
