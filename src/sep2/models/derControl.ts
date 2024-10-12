import {
    derControlBaseSchema,
    parseDERControlBaseXmlObject,
} from './derControlBase.js';
import {
    parseRandomizableEventXmlObject,
    randomizableEventSchema,
} from './randomizableEvent.js';
import { z } from 'zod';

export const derControlSchema = z
    .object({
        derControlBase: derControlBaseSchema,
    })
    .merge(randomizableEventSchema);

export type DERControl = z.infer<typeof derControlSchema>;

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
