import EventEmitter from 'events';
import { type PollRate } from '../models/pollRate.js';
import { type SEP2Client } from '../client.js';
import { pinoLogger } from '../../helpers/logger.js';

export abstract class PollableResource<
    ResponseType extends { pollRate: PollRate },
> extends EventEmitter<{
    data: [ResponseType];
}> {
    private client: SEP2Client;
    private url: string;
    private defaultPollRateSeconds: number;
    private pollTimerId: NodeJS.Timeout | null = null;
    private abortController: AbortController;

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
        this.abortController = new AbortController();

        void this.poll();
    }

    abstract get(params: {
        client: SEP2Client;
        url: string;
        signal: AbortSignal;
    }): Promise<ResponseType>;

    public async poll() {
        // cancel any existing poll timer
        if (this.pollTimerId) {
            clearTimeout(this.pollTimerId);
        }

        const response = await (async () => {
            try {
                return await this.get({
                    client: this.client,
                    url: this.url,
                    signal: this.abortController.signal,
                });
            } catch (error) {
                pinoLogger.error(error, 'Failed to poll resource');

                return null;
            }
        })();

        if (this.abortController.signal.aborted) {
            return;
        }

        if (response) {
            this.emit('data', response);
        }

        const pollRate = response?.pollRate || this.defaultPollRateSeconds;

        // schedule next poll
        this.pollTimerId = setTimeout(() => {
            void this.poll();
        }, pollRate * 1000);
    }

    public destroy() {
        this.abortController.abort();

        if (this.pollTimerId) {
            clearTimeout(this.pollTimerId);
        }
    }
}
