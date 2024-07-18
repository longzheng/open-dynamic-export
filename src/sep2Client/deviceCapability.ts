import type { Link } from './link';
import { parseLinkXml } from './link';

export type DeviceCapabilityResponse = {
    timeLink: Link;
    endDeviceListLink: Link;
    mirrorUsagePointListLink: Link;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDeviceCapabilityXml(xml: any): DeviceCapabilityResponse {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const timeLink = parseLinkXml(xml['DeviceCapability']['TimeLink'][0]);
    const endDeviceListLink = parseLinkXml(
        xml['DeviceCapability']['EndDeviceListLink'][0],
    );
    const mirrorUsagePointListLink = parseLinkXml(
        xml['DeviceCapability']['MirrorUsagePointListLink'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        timeLink,
        endDeviceListLink,
        mirrorUsagePointListLink,
    };
}
