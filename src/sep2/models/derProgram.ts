import { assertString } from '../helpers/assert.js';
import { linkSchema, parseLinkXmlObject } from './link.js';
import { safeParseIntString } from '../../helpers/number.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';
import {
    identifiedObjectSchema,
    parseIdentifiedObjectXmlObject,
} from './identifiedObject.js';
import { listLinkSchema, parseListLinkXmlObject } from './listLink.js';
import { z } from 'zod';

export const derProgramSchema = z
    .object({
        defaultDerControlLink: linkSchema.optional(),
        derControlListLink: listLinkSchema.optional(),
        derCurveListLink: listLinkSchema.optional(),
        primacy: z.number(),
    })
    .merge(subscribableResourceSchema)
    .merge(identifiedObjectSchema);

export type DERProgram = z.infer<typeof derProgramSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERProgramXmlObject(xmlObject: any): DERProgram {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const defaultDerControlLink = xmlObject['DefaultDERControlLink']
        ? parseLinkXmlObject(xmlObject['DefaultDERControlLink'][0])
        : undefined;
    const derControlListLink = xmlObject['DERControlListLink']
        ? parseListLinkXmlObject(xmlObject['DERControlListLink'][0])
        : undefined;
    const derCurveListLink = xmlObject['DERCurveListLink']
        ? parseListLinkXmlObject(xmlObject['DERCurveListLink'][0])
        : undefined;
    const primacy = safeParseIntString(assertString(xmlObject['primacy'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        ...identifiedObject,
        defaultDerControlLink,
        derControlListLink,
        derCurveListLink,
        primacy,
    };
}
