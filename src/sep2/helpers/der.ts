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
import { PVConn } from '../../sunspec/models/status.js';
import type { PollRate } from '../models/pollRate.js';
import type { InverterSunSpecConnection } from '../../sunspec/connection/inverter.js';
import deepEqual from 'fast-deep-equal';
import type { RampRateHelper } from '../../coordinator/helpers/rampRate.js';
import { DERControlType } from '../models/derControlType.js';
import { enumHasValue } from '../../helpers/enum.js';
import {
    convertNumberToBaseAndPow10Exponent,
    sumNumbersArray,
    sumNumbersNullableArray,
} from '../../helpers/number.js';
import { ConnectStatus } from '../models/connectStatus.js';
import { DOEModesSupportedType } from '../models/doeModesSupportedType.js';
import type { OperationalModeStatus } from '../models/operationModeStatus.js';
import {
    generateInverterDataStatus,
    type InverterData,
} from '../../coordinator/helpers/inverterData.js';

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
    private invertersConnections: InverterSunSpecConnection[];
    private pollTimer: NodeJS.Timeout | null = null;
    private rampRateHelper: RampRateHelper;

    constructor({
        client,
        invertersConnections,
        rampRateHelper,
    }: {
        client: SEP2Client;
        invertersConnections: InverterSunSpecConnection[];
        rampRateHelper: RampRateHelper;
    }) {
        this.client = client;
        this.invertersConnections = invertersConnections;
        this.rampRateHelper = rampRateHelper;

        this.logger = pinoLogger.child({ module: 'DerHelper' });
    }

    configureDer(config: Config) {
        this.logger.debug({ config }, 'Updated DerHelper with config');
        this.config = config;

        if (!this.pollTimer) {
            void this.poll();
        }
    }

    public onInverterData(data: InverterData[]) {
        const derCapability = getDerCapabilityResponseFromInverterData(data);

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

            this.lastSentDerCapability = derCapability;
        }

        const derSettings = getDerSettingsResponseFromInverterData({
            data,
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

            this.lastSentDerSettings = derSettings;
        }

        const derStatus = getDerStatusResponseFromInverterData(data);

        this.logger.trace(
            {
                derStatus,
                lastSentDerStatus: this.lastSentDerStatus,
            },
            'DER status',
        );

        if (!this.isDerStatusEqual(derStatus, this.lastSentDerStatus)) {
            void this.putDerStatus({ derStatus });

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

        try {
            const inverterData = await Promise.all(
                this.invertersConnections.map(async (inverter) => {
                    return {
                        status: await inverter.getStatusModel(),
                    };
                }),
            );

            const data = inverterData.map((data) => ({
                status: generateInverterDataStatus(data),
            }));

            const derStatus = getDerStatusResponseFromInverterData(data);

            void this.putDerStatus({ derStatus });

            this.lastSentDerStatus = derStatus;
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
            await this.client.put(this.config.der.derCapabilityLink.href, xml);
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
            await this.client.put(this.config.der.derSettingsLink.href, xml);
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
            await this.client.put(this.config.der.derStatusLink.href, xml);
        } catch (error) {
            this.logger.error(error, 'Error updating DER capability');
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

export function getDerCapabilityResponseFromInverterData(
    data: Pick<InverterData, 'nameplate'>[],
): DERCapability {
    // get the highest DERTyp value
    const type = Math.max(...data.map((d) => d.nameplate.type));
    const rtgMaxVA = convertNumberToBaseAndPow10Exponent(
        sumNumbersArray(data.map((d) => d.nameplate.maxVA)),
    );
    const rtgMaxW = convertNumberToBaseAndPow10Exponent(
        sumNumbersArray(data.map((d) => d.nameplate.maxW)),
    );
    const rtgMaxVar = convertNumberToBaseAndPow10Exponent(
        sumNumbersArray(data.map((d) => d.nameplate.maxVar)),
    );

    return {
        // hard-coded modes
        modesSupported: derControlTypeModes,
        // hard-coded DOE modes
        doeModesSupported:
            DOEModesSupportedType.opModExpLimW |
            DOEModesSupportedType.opModGenLimW,
        type,
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

export function getDerSettingsResponseFromInverterData({
    data,
    rampRateHelper,
}: {
    data: InverterData[];
    rampRateHelper: RampRateHelper;
}): DERSettings {
    const maxVA = sumNumbersNullableArray(data.map((d) => d.settings.maxVA));
    const setMaxVA = maxVA ? convertNumberToBaseAndPow10Exponent(maxVA) : null;
    const setMaxW = convertNumberToBaseAndPow10Exponent(
        sumNumbersArray(data.map((d) => d.settings.maxW)),
    );
    const maxVar = sumNumbersNullableArray(data.map((d) => d.settings.maxVar));
    const setMaxVar = maxVar
        ? convertNumberToBaseAndPow10Exponent(maxVar)
        : null;

    return {
        updatedTime: new Date(),
        // hard-coded modes
        modesEnabled: derControlTypeModes,
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

export function getDerStatusResponseFromInverterData(
    data: Pick<InverterData, 'status'>[],
): DERStatus {
    const now = new Date();
    const operationalModeStatus: OperationalModeStatus = Math.max(
        ...data.map((d) => d.status.operationalModeStatus),
    );
    const genConnectStatus: ConnectStatus = Math.max(
        ...data.map((d) => d.status.genConnectStatus),
    );

    return {
        readingTime: now,
        operationalModeStatus: {
            dateTime: now,
            value: operationalModeStatus,
        },
        genConnectStatus: {
            dateTime: now,
            value: genConnectStatus,
        },
    };
}

export function getConnectStatusFromPVConn(pvConn: PVConn): ConnectStatus {
    let result: ConnectStatus = 0 as ConnectStatus;

    if (enumHasValue(pvConn, PVConn.CONNECTED)) {
        result += ConnectStatus.Connected;
    }

    if (enumHasValue(pvConn, PVConn.AVAILABLE)) {
        result += ConnectStatus.Available;
    }

    if (enumHasValue(pvConn, PVConn.OPERATING)) {
        result += ConnectStatus.Operating;
    }

    if (enumHasValue(pvConn, PVConn.TEST)) {
        result += ConnectStatus.Test;
    }

    return result;
}
