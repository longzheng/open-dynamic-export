import { z } from 'zod';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { linkSchema, parseLinkXmlObject } from './link.js';

export const listLinkSchema = z
    .object({
        all: z.number().optional(),
    })
    .merge(linkSchema);

export type ListLink = z.infer<typeof listLinkSchema>;
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
