import EventEmitter from 'node:events';
import { defaultPollPushRates, type SEP2Client } from '../client.js';
import { PollableResource } from './pollableResource.js';
import { type DERList } from '../models/derList.js';
import { parseDerListXml } from '../models/derList.js';
import { getListAll } from './pagination.js';

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

            this.derListPollableResource?.destroy();

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
    async get({
        client,
        url,
        signal,
    }: {
        client: SEP2Client;
        url: string;
        signal: AbortSignal;
    }) {
        return getListAll({
            client,
            url,
            options: { signal },
            parseXml: parseDerListXml,
            addItems: (allResults, result) => {
                allResults.ders.push(...result.ders);
            },
            getItems: (result) => result.ders,
        });
    }
}
