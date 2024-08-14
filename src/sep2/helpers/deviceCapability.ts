import EventEmitter from 'events';
import { defaultPollPushRates, type SEP2Client } from '../client';
import { PollableResource } from './pollableResource';
import {
    parseDeviceCapabilityXml,
    type DeviceCapability,
} from '../models/deviceCapability';

export class DeviceCapabilityHelper extends EventEmitter<{
    data: [DeviceCapability];
}> {
    constructor({ client, href }: { client: SEP2Client; href: string }) {
        super();

        const resource = new DeviceCapabilityPollableResource({
            client,
            url: href,
            defaultPollRateSeconds: defaultPollPushRates.deviceCapabilityPoll,
        });

        resource.on('data', (data) => {
            this.emit('data', data);
        });
    }
}

class DeviceCapabilityPollableResource extends PollableResource<DeviceCapability> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await client.getRequest(url);

        return parseDeviceCapabilityXml(xml);
    }
}
