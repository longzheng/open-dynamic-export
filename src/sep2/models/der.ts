import * as v from 'valibot';
import { linkSchema, parseLinkXmlObject } from './link.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';

export const derSchema = v.intersect([
    v.object({
        derAvailabilityLink: v.optional(linkSchema),
        derCapabilityLink: v.optional(linkSchema),
        derSettingsLink: v.optional(linkSchema),
        derStatusLink: v.optional(linkSchema),
    }),
    subscribableResourceSchema,
]);

export type DER = v.InferOutput<typeof derSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerXmlObject(xmlObject: any): DER {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const derAvailabilityLink = xmlObject['DERAvailabilityLink']
        ? parseLinkXmlObject(xmlObject['DERAvailabilityLink'][0])
        : undefined;
    const derCapabilityLink = xmlObject['DERCapabilityLink']
        ? parseLinkXmlObject(xmlObject['DERCapabilityLink'][0])
        : undefined;
    const derSettingsLink = xmlObject['DERSettingsLink']
        ? parseLinkXmlObject(xmlObject['DERSettingsLink'][0])
        : undefined;
    const derStatusLink = xmlObject['DERStatusLink']
        ? parseLinkXmlObject(xmlObject['DERStatusLink'][0])
        : undefined;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        derAvailabilityLink,
        derCapabilityLink,
        derSettingsLink,
        derStatusLink,
    };
}
