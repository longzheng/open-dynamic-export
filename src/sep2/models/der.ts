import { parseLinkXmlObject, type Link } from './link.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';

export type DER = {
    derAvailabilityLink: Link | undefined;
    derCapabilityLink: Link | undefined;
    derSettingsLink: Link | undefined;
    derStatusLink: Link | undefined;
} & SubscribableResource;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerXmlObject(xmlObject: any): DER {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        derAvailabilityLink,
        derCapabilityLink,
        derSettingsLink,
        derStatusLink,
    };
}
