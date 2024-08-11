import EventEmitter from 'events';
import type { PollRate } from '../models/pollRate';
import type { SEP2Client } from '../client';

export abstract class PollableResource<
    ResponseType extends { pollRate: PollRate },
> extends EventEmitter<{
    data: [ResponseType];
}> {
    private client: SEP2Client;
    private url: string;
    private defaultPollRateSeconds: number;
    private pollTimerId: NodeJS.Timeout | null = null;

    constructor({
        client,
        url,
        defaultPollRateSeconds,
    }: {
        client: SEP2Client;
        url: string;
        defaultPollRateSeconds: number;
    }) {
        super();

        this.client = client;
        this.url = url;
        this.defaultPollRateSeconds = defaultPollRateSeconds;

        void this.poll();
    }

    abstract get({
        client,
        url,
    }: {
        client: SEP2Client;
        url: string;
    }): Promise<ResponseType>;

    public async poll() {
        const response = await this.get({ client: this.client, url: this.url });

        this.emit('data', response);

        const pollRate = response.pollRate || this.defaultPollRateSeconds;

        // schedule next poll
        this.pollTimerId = setTimeout(() => {
            void this.poll();
        }, pollRate * 1000);
    }

    public destroy() {
        if (this.pollTimerId) {
            clearTimeout(this.pollTimerId);
        }
    }
}