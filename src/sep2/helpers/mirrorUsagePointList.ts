import type { SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { PollableResource } from './pollableResource.js';
import type { MirrorUsagePointList } from '../models/mirrorUsagePointList.js';
import { parseMirrorUsagePointListXml } from '../models/mirrorUsagePointList.js';
import { MirrorUsagePointSiteHelper } from './mirrorUsagePointSite.js';
import { MirrorUsagePointDerHelper } from './mirrorUsagePointDer.js';
import { getListAll } from './pagination.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';
import type { SiteSample } from '../../meters/siteSample.js';

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

    public addDerSample(derSample: DerSample) {
        this.mirrorUsagePointDer?.addSample(derSample);
    }

    public addSiteSample(siteSample: SiteSample) {
        this.mirrorUsagePointSite?.addSample(siteSample);
    }
}

class MirrorUsagePointListPollableResource extends PollableResource<MirrorUsagePointList> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        return getListAll({
            client,
            url,
            parseXml: parseMirrorUsagePointListXml,
            addItems: (allResults, result) => {
                allResults.mirrorUsagePoints.push(...result.mirrorUsagePoints);
            },
            getItems: (result) => result.mirrorUsagePoints,
        });
    }
}
