import type { SEP2Client } from '../client';
import { defaultPollPushRates } from '../client';
import { PollableResource } from './pollableResource';
import type { MirrorUsagePointList } from '../models/mirrorUsagePointList';
import { parseMirrorUsagePointListXml } from '../models/mirrorUsagePointList';
import { MirrorUsagePointSiteHelper } from './mirrorUsagePointSite';
import type { MonitoringSample } from '../../coordinator.ts/monitoring';
import { MirrorUsagePointDerHelper } from './mirrorUsagePointDer';

export class MirrorUsagePointListHelper {
    private href: string | null = null;
    private client: SEP2Client;
    private mirrorUsagePointListPollableResource: MirrorUsagePointListPollableResource | null =
        null;
    private mirrorUsagePointSite: MirrorUsagePointSiteHelper | null = null;
    private mirrorUsagePointDer: MirrorUsagePointDerHelper | null = null;

    constructor({ client }: { client: SEP2Client }) {
        this.client = client;

        this.mirrorUsagePointSite = new MirrorUsagePointSiteHelper({
            client,
        });

        this.mirrorUsagePointDer = new MirrorUsagePointDerHelper({
            client,
        });
    }

    updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.destroy();

            this.mirrorUsagePointListPollableResource =
                new MirrorUsagePointListPollableResource({
                    client: this.client,
                    url: href,
                    defaultPollRateSeconds:
                        defaultPollPushRates.mirrorUsagePointPush,
                }).on('data', (data) => {
                    void this.mirrorUsagePointSite?.updateMirrorUsagePointList({
                        mirrorUsagePoints: data.mirrorUsagePoints,
                        mirrorUsagePointListHref: href,
                    });

                    void this.mirrorUsagePointDer?.updateMirrorUsagePointList({
                        mirrorUsagePoints: data.mirrorUsagePoints,
                        mirrorUsagePointListHref: href,
                    });
                });
        }

        return this;
    }

    public destroy() {
        this.mirrorUsagePointListPollableResource?.destroy();
    }

    public addSample(sample: MonitoringSample) {
        this.mirrorUsagePointSite?.addSample(sample);
        this.mirrorUsagePointDer?.addSample(sample);
    }
}

class MirrorUsagePointListPollableResource extends PollableResource<MirrorUsagePointList> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await client.getRequest(
            url,
            // get all records
            // TODO: handle pagination more elegantly
            { s: '0', l: '255' },
        );

        return parseMirrorUsagePointListXml(xml);
    }
}