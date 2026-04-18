import * as v from 'valibot';
import { assertArray } from '../helpers/assert.js';
import { derControlSchema, parseDERControlXmlObject } from './derControl.js';
import {
    parseSubscribableListXmlObject,
    subscribableListSchema,
} from './subscribableList.js';

export const derControlListSchema = v.intersect([
    v.object({
        derControls: v.array(derControlSchema),
    }),
    subscribableListSchema,
]);

export type DERControlList = v.InferOutput<typeof derControlListSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerControlListXml(xml: any): DERControlList {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['DERControlList'],
    );
    const derControlArray = assertArray(xml['DERControlList']['DERControl']);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    const derControls = derControlArray.map((derControlXml) =>
        parseDERControlXmlObject(derControlXml),
    );

    return {
        ...subscribableList,
        derControls,
    };
}
