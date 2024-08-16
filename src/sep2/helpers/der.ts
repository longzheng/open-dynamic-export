import { defaultPollPushRates, type SEP2Client } from '../client';
import type { DER } from '../models/der';
import type { DERCapabilityResponse } from '../models/derCapability';
import { generateDerCapabilityResponse } from '../models/derCapability';
import type { DERSettings } from '../models/derSettings';
import { generateDerSettingsResponse } from '../models/derSettings';
import { generateDerStatusResponse, type DERStatus } from '../models/derStatus';
import { objectToXml } from './xml';
import { logger as pinoLogger } from '../../logger';
import type { Logger } from 'pino';
import {
    getDerCapabilityResponseFromSunSpecArray,
    getDerSettingsResponseFromSunSpecArray,
    getDerStatusResponseFromSunSpecArray,
} from '../../coordinator/der';
import type { NameplateModel } from '../../sunspec/models/nameplate';
import type { SettingsModel } from '../../sunspec/models/settings';
import type { StatusModel } from '../../sunspec/models/status';
import type { PollRate } from '../models/pollRate';
import type { InverterSunSpecConnection } from '../../sunspec/connection/inverter';

type Config = {
    der: DER;
    pollRate: PollRate;
};

// https://sunspec.org/wp-content/uploads/2019/08/CSIPImplementationGuidev2.103-15-2018.pdf
// For DERCapability and DERSettings, the Aggregator posts these resources at device start-up and on any changes.
// For DERStatus, the Aggregator posts at the rate specified in DERList:pollRate.
export class DerHelper {
    private client: SEP2Client;
    private config: Config | null = null;
    private logger: Logger;
    private lastSentDerCapability: DERCapabilityResponse | null = null;
    private lastSentDerSettings: DERSettings | null = null;
    private lastSentDerStatus: DERStatus | null = null;
    private invertersConnections: InverterSunSpecConnection[];
    private pollTimer: NodeJS.Timeout | null = null;

    constructor({
        client,
        invertersConnections,
    }: {
        client: SEP2Client;
        invertersConnections: InverterSunSpecConnection[];
    }) {
        this.client = client;
        this.invertersConnections = invertersConnections;

        this.logger = pinoLogger.child({ module: 'DerHelper' });
    }

    configureDer(config: Config) {
        this.logger.info(config, 'Updated DerHelper with config');
        this.config = config;

        if (!this.pollTimer) {
            void this.poll();
        }
    }

    public onInverterData(
        data: {
            nameplate: NameplateModel;
            settings: SettingsModel;
            status: StatusModel;
        }[],
    ) {
        const derCapability = getDerCapabilityResponseFromSunSpecArray(
            data.map((data) => data.nameplate),
        );

        if (derCapability !== this.lastSentDerCapability) {
            void this.postDerCapability({ derCapability });

            this.lastSentDerCapability = derCapability;
        }

        const derSettings = getDerSettingsResponseFromSunSpecArray(
            data.map((data) => data.settings),
        );

        if (derSettings !== this.lastSentDerSettings) {
            void this.postDerSettings({ derSettings });

            this.lastSentDerSettings = derSettings;
        }

        const derStatus = getDerStatusResponseFromSunSpecArray(
            data.map((data) => data.status),
        );

        if (derStatus !== this.lastSentDerStatus) {
            void this.postDerStatus({ derStatus });

            this.lastSentDerStatus = derStatus;
        }
    }

    private async poll() {
        this.pollTimer = setTimeout(
            () => {
                void this.poll();
            },
            this.config?.pollRate
                ? this.config.pollRate * 1000
                : // fallback to default poll rate for EndDeviceList
                  defaultPollPushRates.endDeviceListPoll * 1000,
        );

        const inverterData = await Promise.all(
            this.invertersConnections.map(async (inverter) => {
                return {
                    status: await inverter.getStatusModel(),
                };
            }),
        );

        const derStatus = getDerStatusResponseFromSunSpecArray(
            inverterData.map((data) => data.status),
        );

        void this.postDerStatus({ derStatus });

        this.lastSentDerStatus = derStatus;
    }

    private async postDerCapability({
        derCapability,
    }: {
        derCapability: DERCapabilityResponse;
    }) {
        if (!this.config?.der) {
            this.logger.info('DER not initialised, skipping postDerCapability');

            return;
        }

        const response = generateDerCapabilityResponse(derCapability);
        const xml = objectToXml(response);

        await this.client.postResponse(
            this.config.der.derCapabilityLink.href,
            xml,
        );
    }

    private async postDerSettings({
        derSettings,
    }: {
        derSettings: DERSettings;
    }) {
        if (!this.config?.der) {
            this.logger.info('DER not initialised, skipping postDerSettings');

            return;
        }

        const response = generateDerSettingsResponse(derSettings);
        const xml = objectToXml(response);

        await this.client.postResponse(
            this.config.der.derSettingsLink.href,
            xml,
        );
    }

    private async postDerStatus({ derStatus }: { derStatus: DERStatus }) {
        if (!this.config?.der) {
            this.logger.info('DER not initialised, skipping postDerStatus');

            return;
        }

        const response = generateDerStatusResponse(derStatus);
        const xml = objectToXml(response);

        await this.client.postResponse(this.config.der.derStatusLink.href, xml);
    }
}
