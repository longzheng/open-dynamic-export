import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject.js';
import { parseLinkXmlObject, type Link } from './link.js';
import { parseListLinkXmlObject, type ListLink } from './listLink.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';

export type FunctionSetAssignments = {
    derProgramListLink: ListLink | undefined;
    responseSetListLink: ListLink | undefined;
    timeLink: Link | undefined;
} & SubscribableResource &
    IdentifiedObject;

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
