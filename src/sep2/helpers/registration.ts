import EventEmitter from 'events';
import { defaultPollPushRates, type SEP2Client } from '../client.js';
import { PollableResource } from './pollableResource.js';
import {
    parseRegistrationXml,
    type Registration,
} from '../models/registration.js';

export class RegistrationHelper extends EventEmitter<{
    data: [Registration];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private registrationPollableResource: RegistrationPollableResource | null =
        null;

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;
    }

    public updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.destroy();

            this.registrationPollableResource =
                new RegistrationPollableResource({
                    client: this.client,
                    url: href,
                    defaultPollRateSeconds:
                        defaultPollPushRates.endDeviceListPoll,
                }).on('data', (data) => {
                    this.emit('data', data);
                });
        }

        return this;
    }

    public destroy() {
        this.registrationPollableResource?.destroy();
    }
}

class RegistrationPollableResource extends PollableResource<Registration> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await client.get(url);

        return parseRegistrationXml(xml);
    }
}
