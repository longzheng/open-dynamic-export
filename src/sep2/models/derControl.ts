import {
    parseDERControlBaseXmlObject,
    type DERControlBase,
} from './derControlBase.js';
import {
    parseRandomizableEventXmlObject,
    type RandomizableEvent,
} from './randomizableEvent.js';

export type DERControl = {
    derControlBase: DERControlBase;
} & RandomizableEvent;

export function parseDERControlXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): DERControl {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const randomizableEvent = parseRandomizableEventXmlObject(xmlObject);
    const derControlBase = parseDERControlBaseXmlObject(
        xmlObject['DERControlBase'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...randomizableEvent,
        derControlBase,
    };
}
