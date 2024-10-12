import { stringHexToEnumType } from '../../helpers/enum.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';
import {
    responseRequiredTypeSchema,
    type ResponseRequiredType,
} from './responseRequired.js';
import { z } from 'zod';

export const respondableResourceSchema = z
    .object({
        replyToHref: z.string().optional(),
        responseRequired: responseRequiredTypeSchema,
    })
    .merge(resourceSchema);

export type RespondableResource = z.infer<typeof respondableResourceSchema>;

export function parseRespondableResourceXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): RespondableResource {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const replyToHref = xmlObject['$']['replyTo']
        ? assertString(xmlObject['$']['replyTo'])
        : undefined;
    const responseRequired = stringHexToEnumType<ResponseRequiredType>(
        assertString(xmlObject['$']['responseRequired']),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        replyToHref,
        responseRequired,
    };
}
