import type { Link } from './link.js';
import { parseLinkXmlObject } from './link.js';
import type { ListLink } from './listLink.js';
import { parseListLinkXmlObject } from './listLink.js';
import { parsePollRateXmlObject, type PollRate } from './pollRate.js';

export type DeviceCapability = {
    pollRate: PollRate;
    timeLink: Link;
    endDeviceListLink: ListLink;
    mirrorUsagePointListLink: ListLink;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDeviceCapabilityXml(xml: any): DeviceCapability {
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
