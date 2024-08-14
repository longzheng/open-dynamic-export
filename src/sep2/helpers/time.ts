import { type SEP2Client } from '../client';
import { PollableResource } from './pollableResource';
import type { Time } from '../models/time';
import { parseTimeXml } from '../models/time';
import type { Logger } from 'pino';
import { logger as pinoLogger } from '../../logger';

export class TimeHelper {
    private href: string | null = null;
    private timePollableResource: TimePollableResource | null = null;
    private logger: Logger;

    constructor() {
        this.logger = pinoLogger.child({ module: 'TimeHelper' });
    }

    public init({
        client,
        href,
        defaultPollRateSeconds,
    }: {
        client: SEP2Client;
        href: string;
        defaultPollRateSeconds: number;
    }) {
        if (this.href !== href) {
            this.href = href;

            this.destroy();

            this.timePollableResource = new TimePollableResource({
                client,
                url: href,
                defaultPollRateSeconds,
            }).on('data', (data) => {
                this.assertTime(data);
            });
        }

        return this;
    }

    private assertTime(time: Time) {
        const now = new Date();
        const delta = now.getTime() - time.currentTime.getTime();

        // 1 minute tolerance
        if (Math.abs(delta) > 60 * 1_000) {
            throw new Error(
                `Clock is not synced with Utility Server, delta ${delta}ms`,
            );
        }

        this.logger.info(
            `Clock is synced with Utility Server, delta ${delta}ms`,
        );
    }

    private destroy() {
        this.timePollableResource?.destroy();
    }
}

class TimePollableResource extends PollableResource<Time> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await client.getRequest(url);

        return parseTimeXml(xml);
    }
}
