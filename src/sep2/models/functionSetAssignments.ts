import * as v from 'valibot';
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

export const functionSetAssignmentsSchema = v.intersect([
    v.object({
        derProgramListLink: v.optional(listLinkSchema),
        responseSetListLink: v.optional(listLinkSchema),
        timeLink: v.optional(linkSchema),
    }),
    subscribableResourceSchema,
    identifiedObjectSchema,
]);

export type FunctionSetAssignments = v.InferOutput<
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
