import { parseLinkXmlObject, type Link } from './link.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';

export type DER = {
    derAvailabilityLink: Link;
    derCapabilityLink: Link;
    derSettingsLink: Link;
    derStatusLink: Link;
} & SubscribableResource;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerXmlObject(xmlObject: any): DER {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const derAvailabilityLink = parseLinkXmlObject(
        xmlObject['DERAvailabilityLink'][0],
    );
    const derCapabilityLink = parseLinkXmlObject(
        xmlObject['DERCapabilityLink'][0],
    );
    const derSettingsLink = parseLinkXmlObject(xmlObject['DERSettingsLink'][0]);
    const derStatusLink = parseLinkXmlObject(xmlObject['DERStatusLink'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        derAvailabilityLink,
        derCapabilityLink,
        derSettingsLink,
        derStatusLink,
    };
}
