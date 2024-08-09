import { type SEP2Client } from '../client';
import { PollableResource } from './pollableResource';
import type { Time } from '../models/time';
import { parseTimeXml } from '../models/time';

export class TimeHelper {
    private href: string | null = null;
    private timePollableResource: TimePollableResource | null = null;

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

        if (Math.abs(delta) > 60000) {
            // 1 minute in milliseconds
            throw new Error(
                `Clock is not synced with Utility Server, delta ${delta}ms`,
            );
        }
    }

    public destroy() {
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
