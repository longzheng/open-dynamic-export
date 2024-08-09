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

export type DERProgram = {
    defaultDERControlLink: Link | undefined;
    derControlListLink: Link | undefined;
    derCurveListLink: Link | undefined;
    primacy: number;
} & SubscribableResource &
    IdentifiedObject;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERProgramXmlObject(xmlObject: any): DERProgram {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const defaultDERControlLink = xmlObject['DefaultDERControlLink']
        ? parseLinkXmlObject(xmlObject['DefaultDERControlLink'][0])
        : undefined;
    const derControlListLink = parseLinkXmlObject(
        xmlObject['DERControlListLink'][0],
    );
    const derCurveListLink = parseLinkXmlObject(
        xmlObject['DERCurveListLink'][0],
    );
    const primacy = safeParseIntString(assertString(xmlObject['primacy'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        ...identifiedObject,
        defaultDERControlLink,
        derControlListLink,
        derCurveListLink,
        primacy,
    };
}
