import { assertString } from '../helpers/assert.js';
import { parseLinkXmlObject, type Link } from './link.js';
import { safeParseIntString } from '../../helpers/number.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject.js';
import { parseListLinkXmlObject, type ListLink } from './listLink.js';

export type DERProgram = {
    defaultDerControlLink: Link | undefined;
    derControlListLink: ListLink | undefined;
    derCurveListLink: ListLink | undefined;
    primacy: number;
} & SubscribableResource &
    IdentifiedObject;

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
