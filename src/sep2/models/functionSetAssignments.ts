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
    derProgramListLink: ListLink;
    responseSetListLink: ListLink;
    timeLink: Link;
} & SubscribableResource &
    IdentifiedObject;

export function parseFunctionSetAssignmentsXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): FunctionSetAssignments {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const derProgramListLink = parseListLinkXmlObject(
        xmlObject['DERProgramListLink'][0],
    );
    const responseSetListLink = parseListLinkXmlObject(
        xmlObject['ResponseSetListLink'][0],
    );
    const timeLink = parseLinkXmlObject(xmlObject['TimeLink'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        ...identifiedObject,
        derProgramListLink,
        responseSetListLink,
        timeLink,
    };
}
