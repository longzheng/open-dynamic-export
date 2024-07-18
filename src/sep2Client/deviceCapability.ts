import type { Link } from './link';
import { parseLinkXmlObject } from './link';

export type DeviceCapabilityResponse = {
    timeLink: Link;
    endDeviceListLink: Link;
    mirrorUsagePointListLink: Link;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDeviceCapabilityXml(xml: any): DeviceCapabilityResponse {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const timeLink = parseLinkXmlObject(xml['DeviceCapability']['TimeLink'][0]);
    const endDeviceListLink = parseLinkXmlObject(
        xml['DeviceCapability']['EndDeviceListLink'][0],
    );
    const mirrorUsagePointListLink = parseLinkXmlObject(
        xml['DeviceCapability']['MirrorUsagePointListLink'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        timeLink,
        endDeviceListLink,
        mirrorUsagePointListLink,
    };
}
