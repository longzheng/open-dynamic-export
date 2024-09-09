import { defaultPollPushRates, type SEP2Client } from '../client.js';
import type { DER } from '../models/der.js';
import type { DERCapability } from '../models/derCapability.js';
import { generateDerCapability } from '../models/derCapability.js';
import type { DERSettings } from '../models/derSettings.js';
import { generateDerSettingsResponse } from '../models/derSettings.js';
import {
    generateDerStatusResponse,
    OperationalModeStatus,
    type DERStatus,
} from '../models/derStatus.js';
import { objectToXml } from './xml.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { Logger } from 'pino';
import { DERTyp, type NameplateModel } from '../../sunspec/models/nameplate.js';
import type { SettingsModel } from '../../sunspec/models/settings.js';
import { PVConn, type StatusModel } from '../../sunspec/models/status.js';
import type { PollRate } from '../models/pollRate.js';
import type { InverterSunSpecConnection } from '../../sunspec/connection/inverter.js';
import deepEqual from 'fast-deep-equal';
import type { RampRateHelper } from '../../coordinator/helpers/rampRate.js';
import { DERControlType } from '../models/derControlType.js';
import { enumHasValue } from '../../helpers/enum.js';
import { convertNumberToBaseAndPow10Exponent } from '../../helpers/number.js';
import { getAggregatedNameplateMetrics } from '../../sunspec/helpers/nameplateMetrics.js';
import { getAggregatedSettingsMetrics } from '../../sunspec/helpers/settingsMetrics.js';
import { getAggregatedStatusMetrics } from '../../sunspec/helpers/statusMetrics.js';
import { ConnectStatus } from '../models/connectStatus.js';
import { DOEModesSupportedType } from '../models/doeModesSupportedType.js';
import { DERType } from '../models/derType.js';

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

        const derSettings = getDerSettingsResponseFromSunSpecArray({
            settingsModels: data.map((data) => data.settings),
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

        const derStatus = getDerStatusResponseFromSunSpecArray(
            data.map((data) => data.status),
        );

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

            const derStatus = getDerStatusResponseFromSunSpecArray(
                inverterData.map((data) => data.status),
            );

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

export function getDerCapabilityResponseFromSunSpecArray(
    nameplateModels: NameplateModel[],
): DERCapability {
    const metrics = getAggregatedNameplateMetrics(nameplateModels);
    const rtgMaxVA = convertNumberToBaseAndPow10Exponent(metrics.VARtg);
    const rtgMaxW = convertNumberToBaseAndPow10Exponent(metrics.WRtg);
    const rtgMaxVar = convertNumberToBaseAndPow10Exponent(metrics.VArRtgQ1);

    return {
        // hard-coded modes
        modesSupported: derControlTypeModes,
        // hard-coded DOE modes
        doeModesSupported:
            DOEModesSupportedType.opModExpLimW |
            DOEModesSupportedType.opModGenLimW,
        type: (() => {
            switch (metrics.DERTyp) {
                case DERTyp.PV:
                    return DERType.PhotovoltaicSystem;
                case DERTyp.PV_STOR:
                    return DERType.CombinedPVAndStorage;
            }
        })(),
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
        // there's no way to get the nominal voltage from the SunSpec nameplate model
        // VNom is available from the DER Capacity 702 model but it's not widely available
        // https://sunspec.org/wp-content/uploads/2021/02/SunSpec-DER-Information-Model-Specification-V1-0-02-01-2021.pdf
        rtgVNom: undefined,
    };
}

export function getDerSettingsResponseFromSunSpecArray({
    settingsModels,
    rampRateHelper,
}: {
    settingsModels: SettingsModel[];
    rampRateHelper: RampRateHelper;
}): DERSettings {
    const metrics = getAggregatedSettingsMetrics(settingsModels);
    const setMaxVA = metrics.VAMax
        ? convertNumberToBaseAndPow10Exponent(metrics.VAMax)
        : null;
    const setMaxW = convertNumberToBaseAndPow10Exponent(metrics.WMax);
    const setMaxVar = metrics.VArMaxQ1
        ? convertNumberToBaseAndPow10Exponent(metrics.VArMaxQ1)
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

export function getDerStatusResponseFromSunSpecArray(
    statusModels: StatusModel[],
): DERStatus {
    const metrics = getAggregatedStatusMetrics(statusModels);
    const now = new Date();
    const operationalModeStatus: OperationalModeStatus = enumHasValue(
        metrics.PVConn,
        PVConn.CONNECTED,
    )
        ? OperationalModeStatus.OperationalMode
        : OperationalModeStatus.Off;
    const genConnectStatus: ConnectStatus = getConnectStatusFromPVConn(
        metrics.PVConn,
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
