import { type SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { PollableResource } from './pollableResource.js';
import { type MirrorUsagePointList } from '../models/mirrorUsagePointList.js';
import { parseMirrorUsagePointListXml } from '../models/mirrorUsagePointList.js';
import { MirrorUsagePointSiteHelper } from './mirrorUsagePointSite.js';
import { MirrorUsagePointDerHelper } from './mirrorUsagePointDer.js';
import { getListAll } from './pagination.js';
import { type DerSample } from '../../coordinator/helpers/derSample.js';
import { type SiteSample } from '../../meters/siteSample.js';
import { type EndDevice } from '../models/endDevice.js';

export class MirrorUsagePointListHelper {
    private href: string | null = null;
    private client: SEP2Client;
    private mirrorUsagePointListPollableResource: MirrorUsagePointListPollableResource | null =
        null;
    private mirrorUsagePointSite: MirrorUsagePointSiteHelper;
    private mirrorUsagePointDer: MirrorUsagePointDerHelper;

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

            this.mirrorUsagePointListPollableResource?.destroy();

            this.mirrorUsagePointListPollableResource =
                new MirrorUsagePointListPollableResource({
                    client: this.client,
                    url: href,
                    defaultPollRateSeconds:
                        defaultPollPushRates.mirrorUsagePointPush,
                }).on('data', (data) => {
                    void this.mirrorUsagePointSite.updateMirrorUsagePointList({
                        mirrorUsagePoints: data.mirrorUsagePoints,
                        mirrorUsagePointListHref: href,
                    });

                    void this.mirrorUsagePointDer.updateMirrorUsagePointList({
                        mirrorUsagePoints: data.mirrorUsagePoints,
                        mirrorUsagePointListHref: href,
                    });
                });
        }

        return this;
    }

    public updateEndDevice({ endDevice }: { endDevice: EndDevice }) {
        void this.mirrorUsagePointSite.setEndDevice({ endDevice });
        void this.mirrorUsagePointDer.setEndDevice({ endDevice });
    }

    public destroy() {
        this.mirrorUsagePointListPollableResource?.destroy();
        this.mirrorUsagePointSite.destroy();
        this.mirrorUsagePointDer.destroy();
    }

    public addDerSample(derSample: DerSample) {
        this.mirrorUsagePointDer.addSample(derSample);
    }

    public addSiteSample(siteSample: SiteSample) {
        this.mirrorUsagePointSite.addSample(siteSample);
    }
}

class MirrorUsagePointListPollableResource extends PollableResource<MirrorUsagePointList> {
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
            parseXml: parseMirrorUsagePointListXml,
            addItems: (allResults, result) => {
                allResults.mirrorUsagePoints.push(...result.mirrorUsagePoints);
            },
            getItems: (result) => result.mirrorUsagePoints,
        });
    }
}
