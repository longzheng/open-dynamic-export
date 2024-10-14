import { z } from 'zod';
import { linkSchema, parseLinkXmlObject } from './link.js';
import { listLinkSchema, parseListLinkXmlObject } from './listLink.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';

export const deviceCapabilitySchema = z.object({
    pollRate: pollRateSchema,
    timeLink: linkSchema,
    endDeviceListLink: listLinkSchema,
    mirrorUsagePointListLink: listLinkSchema,
});

export type DeviceCapability = z.infer<typeof deviceCapabilitySchema>;

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
