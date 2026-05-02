import * as v from 'valibot';
import { assertString } from '../helpers/assert.js';
import { stringToBoolean } from '../helpers/boolean.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';

export const subscribableResourceSchema = v.intersect([
    v.object({
        subscribable: v.boolean(),
    }),
    resourceSchema,
]);

export type SubscribableResource = v.InferOutput<
    typeof subscribableResourceSchema
>;

export function parseSubscribableResourceXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): SubscribableResource {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const subscribable = xmlObject['$']['subscribable']
        ? stringToBoolean(assertString(xmlObject['$']['subscribable']))
        : false;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        subscribable,
    };
}
