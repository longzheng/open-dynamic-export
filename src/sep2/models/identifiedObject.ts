import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';

export const identifiedObjectSchema = v.intersect([
    v.object({
        description: v.optional(v.string()),
        mRID: v.string(),
        version: v.optional(v.number()),
    }),
    resourceSchema,
]);

export type IdentifiedObject = v.InferOutput<typeof identifiedObjectSchema>;

export function parseIdentifiedObjectXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): IdentifiedObject {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const mRID = assertString(xmlObject['mRID'][0]);
    const description = xmlObject['description']
        ? assertString(xmlObject['description'][0])
        : undefined;
    const version = xmlObject['version']
        ? safeParseIntString(assertString(xmlObject['version'][0]))
        : undefined;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        description,
        mRID,
        version,
    };
}
