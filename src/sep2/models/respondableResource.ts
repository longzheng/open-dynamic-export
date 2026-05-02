import * as v from 'valibot';
import { stringHexToEnumType } from '../../helpers/enum.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';
import {
    responseRequiredTypeSchema,
    type ResponseRequiredType,
} from './responseRequired.js';

export const respondableResourceSchema = v.intersect([
    v.object({
        replyToHref: v.optional(v.string()),
        responseRequired: responseRequiredTypeSchema,
    }),
    resourceSchema,
]);

export type RespondableResource = v.InferOutput<
    typeof respondableResourceSchema
>;

export function parseRespondableResourceXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): RespondableResource {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const replyToHref = xmlObject['$']['replyTo']
        ? assertString(xmlObject['$']['replyTo'])
        : undefined;
    const responseRequired = stringHexToEnumType<ResponseRequiredType>(
        assertString(xmlObject['$']['responseRequired']),
    );
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        replyToHref,
        responseRequired,
    };
}
