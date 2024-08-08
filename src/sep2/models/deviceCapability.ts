import type { Link } from './link';
import { parseLinkXmlObject } from './link';
import type { ListLink } from './listLink';
import { parseListLinkXmlObject } from './listLink';
import { parsePollRateXmlObject, type PollRate } from './pollRate';

export type DeviceCapabilityResponse = {
    pollRate: PollRate;
    timeLink: Link;
    endDeviceListLink: ListLink;
    mirrorUsagePointListLink: ListLink;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDeviceCapabilityXml(xml: any): DeviceCapabilityResponse {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const pollRate = parsePollRateXmlObject(xml['DeviceCapability']);
    const timeLink = parseLinkXmlObject(xml['DeviceCapability']['TimeLink'][0]);
    const endDeviceListLink = parseListLinkXmlObject(
        xml['DeviceCapability']['EndDeviceListLink'][0],
    );
    const mirrorUsagePointListLink = parseListLinkXmlObject(
        xml['DeviceCapability']['MirrorUsagePointListLink'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        pollRate,
        timeLink,
        endDeviceListLink,
        mirrorUsagePointListLink,
    };
}
