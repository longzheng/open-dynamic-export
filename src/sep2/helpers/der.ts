import type { SEP2Client } from '../client';
import type { DER } from '../models/der';
import type { DERCapabilityResponse } from '../models/derCapability';
import { generateDerCapabilityResponse } from '../models/derCapability';
import type { DERSettings } from '../models/derSettings';
import { generateDerSettingsResponse } from '../models/derSettings';
import { generateDerStatusResponse, type DERStatus } from '../models/derStatus';
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

export async function postDerSettings({
    der,
    derSettings,
    client,
}: {
    der: DER;
    derSettings: DERSettings;
    client: SEP2Client;
}) {
    const response = generateDerSettingsResponse(derSettings);
    const xml = objectToXml(response);

    await client.postResponse(der.derSettingsLink.href, xml);
}

export async function postDerStatus({
    der,
    derStatus,
    client,
}: {
    der: DER;
    derStatus: DERStatus;
    client: SEP2Client;
}) {
    const response = generateDerStatusResponse(derStatus);
    const xml = objectToXml(response);

    await client.postResponse(der.derStatusLink.href, xml);
}
