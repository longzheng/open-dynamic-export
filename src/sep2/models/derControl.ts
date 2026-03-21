import * as v from 'valibot';
import {
    derControlBaseSchema,
    parseDERControlBaseXmlObject,
} from './derControlBase.js';
import {
    parseRandomizableEventXmlObject,
    randomizableEventSchema,
} from './randomizableEvent.js';

export const derControlSchema = v.intersect([
    v.object({
        derControlBase: derControlBaseSchema,
    }),
    randomizableEventSchema,
]);

export type DERControl = v.InferOutput<typeof derControlSchema>;

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
