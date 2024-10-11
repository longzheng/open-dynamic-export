import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';
import { z } from 'zod';

export const identifiedObjectSchema = z
    .object({
        description: z.string().optional(),
        mRID: z.string(),
        version: z.number().optional(),
    })
    .merge(resourceSchema);

export type IdentifiedObject = z.infer<typeof identifiedObjectSchema>;

export function parseIdentifiedObjectXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): IdentifiedObject {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const mRID = assertString(xmlObject['mRID'][0]);
    const description = xmlObject['description']
        ? assertString(xmlObject['description'][0])
        : undefined;
    const version = xmlObject['version']
        ? safeParseIntString(assertString(xmlObject['version'][0]))
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        description,
        mRID,
        version,
    };
}
