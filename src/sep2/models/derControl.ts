import {
    parseDERControlBaseXmlObject,
    type DERControlBase,
} from './derControlBase';
import { parseEventXmlObject, type Event } from './event';

export type DERControl = {
    derControlBase: DERControlBase;
} & Event; // TODO: this should be RandomizableEvent but did not bother implementing

export function parseDERControlXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): DERControl {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const event = parseEventXmlObject(xmlObject);
    const derControlBase = parseDERControlBaseXmlObject(
        xmlObject['DERControlBase'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        ...event,
        derControlBase,
    };
}
