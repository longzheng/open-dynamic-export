import EventEmitter from 'events';
import { defaultPollPushRates, type SEP2Client } from '../client.js';
import {
    parseDeviceCapabilityXml,
    type DeviceCapability,
} from '../models/deviceCapability.js';
import { PollableResource } from './pollableResource.js';

export class DeviceCapabilityHelper extends EventEmitter<{
    data: [DeviceCapability];
    pollError: [unknown];
}> {
    private deviceCapabilityPollableResource: DeviceCapabilityPollableResource | null =
        null;

    constructor({ client, href }: { client: SEP2Client; href: string }) {
        super();

        this.deviceCapabilityPollableResource =
            new DeviceCapabilityPollableResource({
                client,
                url: href,
                defaultPollRateSeconds:
                    defaultPollPushRates.deviceCapabilityPoll,
            })
                .on('data', (data) => {
                    this.emit('data', data);
                })
                .on('pollError', (error) => {
                    this.emit('pollError', error);
                });
    }

    destroy() {
        this.deviceCapabilityPollableResource?.destroy();
    }
}

class DeviceCapabilityPollableResource extends PollableResource<DeviceCapability> {
    async get({
        client,
        url,
        signal,
    }: {
        client: SEP2Client;
        url: string;
        signal: AbortSignal;
    }) {
        const xml = await client.get(url, { signal });

        return parseDeviceCapabilityXml(xml);
    }
}
