import type { SEP2Client } from '../client';
import type { DER } from '../models/der';
import type { DERCapabilityResponse } from '../models/derCapability';
import { generateDerCapabilityResponse } from '../models/derCapability';
import { objectToXml } from './xml';

export async function postDerCapability({
    der,
    derCapability,
    client,
}: {
    der: DER;
    derCapability: DERCapabilityResponse;
    client: SEP2Client;
}) {
    const response = generateDerCapabilityResponse(derCapability);
    const xml = objectToXml(response);

    await client.postResponse(der.derCapabilityLink.href, xml);
}
