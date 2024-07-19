import { parseLinkXmlObject, type Link } from './link';

export type DER = {
    link: Link;
    derAvailabilityLink: Link;
    derCapabilityLink: Link;
    derSettingsLink: Link;
    derStatusLink: Link;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerXmlObject(xmlObject: any): DER {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const link = parseLinkXmlObject(xmlObject);
    const derAvailabilityLink = parseLinkXmlObject(
        xmlObject['DERAvailabilityLink'][0],
    );
    const derCapabilityLink = parseLinkXmlObject(
        xmlObject['DERCapabilityLink'][0],
    );
    const derSettingsLink = parseLinkXmlObject(xmlObject['DERSettingsLink'][0]);
    const derStatusLink = parseLinkXmlObject(xmlObject['DERStatusLink'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        link,
        derAvailabilityLink,
        derCapabilityLink,
        derSettingsLink,
        derStatusLink,
    };
}
