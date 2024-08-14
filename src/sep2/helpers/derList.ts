import EventEmitter from 'node:events';
import { defaultPollPushRates, type SEP2Client } from '../client';
import { PollableResource } from './pollableResource';
import type { DERList } from '../models/derList';
import { parseDerListXml } from '../models/derList';

export class DerListHelper extends EventEmitter<{
    data: [DERList];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private derListPollableResource: DerListPollableResource | null = null;

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;
    }

    public updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.destroy();

            this.derListPollableResource = new DerListPollableResource({
                client: this.client,
                url: href,
                defaultPollRateSeconds: defaultPollPushRates.endDeviceListPoll,
            }).on('data', (data) => {
                this.emit('data', data);
            });
        }

        return this;
    }

    public destroy() {
        this.derListPollableResource?.destroy();
    }
}

class DerListPollableResource extends PollableResource<DERList> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await client.getRequest(
            url,
            // get all records
            // TODO: handle pagination more elegantly
            { s: '0', l: '255' },
        );

        return parseDerListXml(xml);
    }
}
