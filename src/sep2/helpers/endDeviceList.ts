import EventEmitter from 'node:events';
import { type SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { PollableResource } from './pollableResource.js';
import {
    parseEndDeviceListXml,
    type EndDeviceList,
} from '../models/endDeviceList.js';
import { getListAll } from './pagination.js';

export class EndDeviceListHelper extends EventEmitter<{
    data: [EndDeviceList];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private endDeviceListPollableResource: EndDeviceListPollableResource | null =
        null;

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;
    }

    updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.endDeviceListPollableResource?.destroy();

            this.endDeviceListPollableResource =
                new EndDeviceListPollableResource({
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

    public async refresh() {
        await this.endDeviceListPollableResource?.poll();
    }

    public destroy() {
        this.endDeviceListPollableResource?.destroy();
    }
}

class EndDeviceListPollableResource extends PollableResource<EndDeviceList> {
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
            parseXml: parseEndDeviceListXml,
            addItems: (allResults, result) => {
                allResults.endDevices.push(...result.endDevices);
            },
            getItems: (result) => result.endDevices,
        });
    }
}
