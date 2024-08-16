import EventEmitter from 'node:events';
import type { SEP2Client } from '../client';
import { defaultPollPushRates } from '../client';
import { PollableResource } from './pollableResource';
import {
    parseEndDeviceListXml,
    type EndDeviceList,
} from '../models/endDeviceList';
import { getListAll } from './pagination';

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

            this.destroy();

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

    public destroy() {
        this.endDeviceListPollableResource?.destroy();
    }
}

class EndDeviceListPollableResource extends PollableResource<EndDeviceList> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        return getListAll({
            client,
            url,
            parseXml: parseEndDeviceListXml,
            addItems: (allResults, result) => {
                allResults.endDevices.push(...result.endDevices);
            },
            getItems: (result) => result.endDevices,
        });
    }
}
