import { z } from 'zod';
import { assertArray } from '../helpers/assert.js';
import { derControlSchema, parseDERControlXmlObject } from './derControl.js';
import {
    parseSubscribableListXmlObject,
    subscribableListSchema,
} from './subscribableList.js';

export const derControlListSchema = z
    .object({
        derControls: derControlSchema.array(),
    })
    .merge(subscribableListSchema);

export type DERControlList = z.infer<typeof derControlListSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerControlListXml(xml: any): DERControlList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['DERControlList'],
    );
    const derControlArray = assertArray(xml['DERControlList']['DERControl']);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const derControls = derControlArray.map((derControlXml) =>
        parseDERControlXmlObject(derControlXml),
    );

    return {
        ...subscribableList,
        derControls,
    };
}
