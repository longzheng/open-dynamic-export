import { assertString } from '../helpers/assert';
import { parseLinkXmlObject, type Link } from './link';
import { safeParseIntString } from '../../number';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject';
import { parseListLinkXmlObject, type ListLink } from './listLink';

export type DERProgram = {
    defaultDerControlLink: Link | undefined;
    derControlListLink: ListLink | undefined;
    derCurveListLink: ListLink | undefined;
    primacy: number;
} & SubscribableResource &
    IdentifiedObject;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERProgramXmlObject(xmlObject: any): DERProgram {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const defaultDerControlLink = xmlObject['DefaultDERControlLink']
        ? parseLinkXmlObject(xmlObject['DefaultDERControlLink'][0])
        : undefined;
    const derControlListLink = parseListLinkXmlObject(
        xmlObject['DERControlListLink'][0],
    );
    const derCurveListLink = parseListLinkXmlObject(
        xmlObject['DERCurveListLink'][0],
    );
    const primacy = safeParseIntString(assertString(xmlObject['primacy'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        ...identifiedObject,
        defaultDerControlLink,
        derControlListLink,
        derCurveListLink,
        primacy,
    };
}
