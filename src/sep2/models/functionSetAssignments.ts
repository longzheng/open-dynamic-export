import { z } from 'zod';
import {
    identifiedObjectSchema,
    parseIdentifiedObjectXmlObject,
} from './identifiedObject.js';
import { linkSchema, parseLinkXmlObject } from './link.js';
import { listLinkSchema, parseListLinkXmlObject } from './listLink.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';

export const functionSetAssignmentsSchema = z
    .object({
        derProgramListLink: listLinkSchema.optional(),
        responseSetListLink: listLinkSchema.optional(),
        timeLink: linkSchema.optional(),
    })
    .merge(subscribableResourceSchema)
    .merge(identifiedObjectSchema);

export type FunctionSetAssignments = z.infer<
    typeof functionSetAssignmentsSchema
>;

export function parseFunctionSetAssignmentsXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): FunctionSetAssignments {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const derProgramListLink = xmlObject['DERProgramListLink']
        ? parseListLinkXmlObject(xmlObject['DERProgramListLink'][0])
        : undefined;
    const responseSetListLink = xmlObject['ResponseSetListLink']
        ? parseListLinkXmlObject(xmlObject['ResponseSetListLink'][0])
        : undefined;
    const timeLink = xmlObject['TimeLink']
        ? parseLinkXmlObject(xmlObject['TimeLink'][0])
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        ...identifiedObject,
        derProgramListLink,
        responseSetListLink,
        timeLink,
    };
}
