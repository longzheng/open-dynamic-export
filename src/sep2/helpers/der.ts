import { defaultPollPushRates, type SEP2Client } from '../client.js';
import type { DER } from '../models/der.js';
import type { DERCapability } from '../models/derCapability.js';
import { generateDerCapability } from '../models/derCapability.js';
import type { DERSettings } from '../models/derSettings.js';
import { generateDerSettingsResponse } from '../models/derSettings.js';
import {
    generateDerStatusResponse,
    type DERStatus,
} from '../models/derStatus.js';
import { objectToXml } from './xml.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { Logger } from 'pino';
import type { PollRate } from '../models/pollRate.js';
import deepEqual from 'fast-deep-equal';
import type { RampRateHelper } from './rampRate.js';
import { DERControlType } from '../models/derControlType.js';
import { convertNumberToBaseAndPow10Exponent } from '../../helpers/number.js';
import { DOEControlType } from '../models/doeModesSupportedType.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';

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
    private lastSentDerCapability: DERCapability | null = null;
    private lastSentDerSettings: DERSettings | null = null;
    private lastSentDerStatus: DERStatus | null = null;
    private pollTimer: NodeJS.Timeout | null = null;
    private rampRateHelper: RampRateHelper;

    constructor({
        client,
        rampRateHelper,
    }: {
        client: SEP2Client;
        rampRateHelper: RampRateHelper;
    }) {
        this.client = client;
        this.rampRateHelper = rampRateHelper;

        this.logger = pinoLogger.child({ module: 'DerHelper' });
    }

    configureDer(config: Config) {
        this.logger.debug({ config }, 'Updated DerHelper with config');
        this.config = config;

        if (!this.pollTimer) {
            this.pollTimer = setTimeout(
                () => {
                    void this.poll();
                },
                this.config.pollRate
                    ? this.config.pollRate * 1000
                    : // fallback to default poll rate for EndDeviceList
                      defaultPollPushRates.endDeviceListPoll * 1000,
            );
        }
    }

    public onDerSample(derSample: DerSample) {
        const derCapability = getDerCapabilityResponse(derSample);

        this.logger.trace(
            {
                derCapability,
                lastSentDerCapability: this.lastSentDerCapability,
            },
            'DER capability',
        );

        if (
            !this.isDerCapabilityEqual(
                derCapability,
                this.lastSentDerCapability,
            )
        ) {
            void this.putDerCapability({ derCapability });
        }

        const derSettings = getDerSettingsResponse({
            derSample,
            rampRateHelper: this.rampRateHelper,
        });

        this.logger.trace(
            {
                derSettings,
                lastSentDerSettings: this.lastSentDerSettings,
            },
            'DER settings',
        );

        if (!this.isDerSettingsEqual(derSettings, this.lastSentDerSettings)) {
            void this.putDerSettings({ derSettings });
        }

        const derStatus = getDerStatusResponse(derSample);

        this.logger.trace(
            {
                derStatus,
                lastSentDerStatus: this.lastSentDerStatus,
            },
            'DER status',
        );

        if (!this.isDerStatusEqual(derStatus, this.lastSentDerStatus)) {
            void this.putDerStatus({ derStatus });
        }
    }

    private async poll() {
        try {
            if (!this.lastSentDerStatus) {
                throw new Error('DER status has not been cached');
            }

            await this.putDerStatus({ derStatus: this.lastSentDerStatus });
        } catch (error) {
            this.logger.error(
                error,
                'Error updating DER status during scheduled poll',
            );
        }
    }

    private async putDerCapability({
        derCapability,
    }: {
        derCapability: DERCapability;
    }) {
        if (!this.config?.der) {
            this.logger.warn('DER not initialised, skipping postDerCapability');

            return;
        }

        this.logger.info({ derCapability }, 'Sending DER capability');

        const response = generateDerCapability(derCapability);
        const xml = objectToXml(response);

        try {
            if (!this.config.der.derCapabilityLink) {
                return;
            }

            await this.client.put(this.config.der.derCapabilityLink.href, xml);

            this.lastSentDerCapability = derCapability;
        } catch (error) {
            this.logger.error(error, 'Error updating DER capability');
        }
    }

    private async putDerSettings({
        derSettings,
    }: {
        derSettings: DERSettings;
    }) {
        if (!this.config?.der) {
            this.logger.warn('DER not initialised, skipping postDerSettings');

            return;
        }

        this.logger.info({ derSettings }, 'Sending DER settings');

        const response = generateDerSettingsResponse(derSettings);
        const xml = objectToXml(response);

        try {
            if (!this.config.der.derSettingsLink) {
                return;
            }

            await this.client.put(this.config.der.derSettingsLink.href, xml);

            this.lastSentDerSettings = derSettings;
        } catch (error) {
            this.logger.error(error, 'Error updating DER settings');
        }
    }

    private async putDerStatus({ derStatus }: { derStatus: DERStatus }) {
        if (!this.config?.der) {
            this.logger.warn('DER not initialised, skipping postDerStatus');

            return;
        }

        this.logger.info({ derStatus }, 'Sending DER status');

        const response = generateDerStatusResponse(derStatus);
        const xml = objectToXml(response);

        try {
            if (!this.config.der.derStatusLink) {
                return;
            }

            await this.client.put(this.config.der.derStatusLink.href, xml);

            this.lastSentDerStatus = derStatus;
        } catch (error) {
            this.logger.error(error, 'Error updating DER status');
        }
    }

    // check if the DERStatus has changed
    // can't directly compare the object because it has time data which will always be different
    private isDerStatusEqual(current: DERStatus, last: DERStatus | null) {
        return (
            current.genConnectStatus.value === last?.genConnectStatus.value &&
            current.operationalModeStatus.value ===
                last.operationalModeStatus.value
        );
    }

    // check if the DERStatus has changed
    // can't directly compare the object because it has time data which will always be different
    private isDerSettingsEqual(current: DERSettings, last: DERSettings | null) {
        return (
            current.modesEnabled === last?.modesEnabled &&
            current.setGradW === last.setGradW &&
            deepEqual(current.setMaxVA, last.setMaxVA) &&
            deepEqual(current.setMaxW, last.setMaxW) &&
            deepEqual(current.setMaxVar, last.setMaxVar)
        );
    }

    private isDerCapabilityEqual(
        current: DERCapability,
        last: DERCapability | null,
    ) {
        return deepEqual(current, last);
    }
}

const derControlTypeModes: DERControlType =
    DERControlType.opModConnect | DERControlType.opModEnergize;

const doeControlTypeModes: DOEControlType =
    DOEControlType.opModExpLimW | DOEControlType.opModGenLimW;

export function getDerCapabilityResponse(
    derSample: Pick<DerSample, 'nameplate'>,
): DERCapability {
    const rtgMaxVA = convertNumberToBaseAndPow10Exponent(
        derSample.nameplate.maxVA,
    );
    const rtgMaxW = convertNumberToBaseAndPow10Exponent(
        derSample.nameplate.maxW,
    );
    const rtgMaxVar = convertNumberToBaseAndPow10Exponent(
        derSample.nameplate.maxVar,
    );

    return {
        // hard-coded modes
        modesSupported: derControlTypeModes,
        // hard-coded DOE modes
        doeModesSupported: doeControlTypeModes,
        type: derSample.nameplate.type,
        rtgMaxVA: {
            value: rtgMaxVA.base,
            multiplier: rtgMaxVA.pow10,
        },
        rtgMaxVar: {
            value: rtgMaxVar.base,
            multiplier: rtgMaxVar.pow10,
        },
        rtgMaxW: {
            value: rtgMaxW.base,
            multiplier: rtgMaxW.pow10,
        },
    };
}

export function getDerSettingsResponse({
    derSample,
    rampRateHelper,
}: {
    derSample: Pick<DerSample, 'settings'>;
    rampRateHelper: RampRateHelper;
}): DERSettings {
    const setMaxVA = derSample.settings.setMaxVA
        ? convertNumberToBaseAndPow10Exponent(derSample.settings.setMaxVA)
        : null;
    const setMaxW = convertNumberToBaseAndPow10Exponent(
        derSample.settings.setMaxW,
    );
    const setMaxVar = derSample.settings.setMaxVar
        ? convertNumberToBaseAndPow10Exponent(derSample.settings.setMaxVar)
        : null;

    return {
        updatedTime: new Date(),
        // hard-coded modes
        modesEnabled: derControlTypeModes,
        // hard-coded DOE modes
        doeModesEnabled: doeControlTypeModes,
        // SunSpec inverters don't properly support WGra
        // so we use a software based implementation of ramp rates
        setGradW: rampRateHelper.getDerSettingsSetGradW(),
        setMaxVA: setMaxVA
            ? {
                  value: setMaxVA.base,
                  multiplier: setMaxVA.pow10,
              }
            : undefined,
        setMaxW: {
            value: setMaxW.base,
            multiplier: setMaxW.pow10,
        },
        setMaxVar: setMaxVar
            ? {
                  value: setMaxVar.base,
                  multiplier: setMaxVar.pow10,
              }
            : undefined,
    };
}

export function getDerStatusResponse(
    derSample: Pick<DerSample, 'status'>,
): DERStatus {
    const now = new Date();

    return {
        readingTime: now,
        operationalModeStatus: {
            dateTime: now,
            value: derSample.status.operationalModeStatus,
        },
        genConnectStatus: {
            dateTime: now,
            value: derSample.status.genConnectStatus,
        },
    };
}
