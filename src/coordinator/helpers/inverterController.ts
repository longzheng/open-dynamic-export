import { type ControlType } from '../../sep2/helpers/controlScheduler.js';
import { Decimal } from 'decimal.js';
import { numberWithPow10, roundToDecimals } from '../../helpers/number.js';
import { type Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';
import {
    writeActiveControlLimit,
    writeInverterControllerPoints,
    writeLatency,
    writeLoadWatts,
} from '../../helpers/influxdb.js';
import { type SiteSample } from '../../meters/siteSample.js';
import { type Limiters } from '../../limiters/index.js';
import {
    objectEntriesWithType,
    objectFromEntriesWithType,
} from '../../helpers/object.js';
import { type Config, type LimiterKeys } from '../../helpers/config.js';
import { cappedChange } from '../../helpers/math.js';
import { type DerSample } from './derSample.js';
import { CappedArrayStack } from '../../helpers/cappedArrayStack.js';
import { timeWeightedAverage } from '../../helpers/timeWeightedAverage.js';
import { differenceInSeconds } from 'date-fns';
import { type ControlsModel } from '../../connections/sunspec/models/controls.js';
import { Publish } from './publish.js';

export type SupportedControlTypes = Extract<
    ControlType,
    | 'opModExpLimW'
    | 'opModGenLimW'
    | 'opModImpLimW'
    | 'opModLoadLimW'
    | 'opModEnergize'
    | 'opModConnect'
>;

export type InverterControlTypes =
    | 'fixed'
    | 'mqtt'
    | 'sep2'
    | 'twoWayTariff'
    | 'negativeFeedIn';

export type InverterControlLimit = {
    source: InverterControlTypes;
    opModEnergize: boolean | undefined;
    opModConnect: boolean | undefined;
    opModGenLimW: number | undefined;
    opModExpLimW: number | undefined;
    opModImpLimW: number | undefined;
    opModLoadLimW: number | undefined;
};

export type InverterConfiguration =
    | { type: 'disconnect' }
    | {
          type: 'limit';
          invertersCount: number;
          targetSolarWatts: number;
          targetSolarPowerRatio: number;
      };

const defaultValues = {
    opModGenLimW: Number.MAX_SAFE_INTEGER,
    opModLoadLimW: Number.MAX_SAFE_INTEGER,
    opModExpLimW: Number.MAX_SAFE_INTEGER,
    opModImpLimW: Number.MAX_SAFE_INTEGER,
    opModEnergize: true,
    opModConnect: true,
} as const satisfies Record<ControlType, unknown>;

export class InverterController {
    private publish: Publish;
    private cachedDerSample = new CappedArrayStack<DerSample>({ limit: 100 });
    private cachedSiteSample = new CappedArrayStack<SiteSample>({ limit: 100 });
    private logger: Logger;
    private limiters: Limiters;
    private loadWattsCache: number | null = null;
    private controlLimitsCache: {
        controlLimitsByLimiter: Record<
            LimiterKeys,
            InverterControlLimit | null
        >;
        activeInverterControlLimit: ActiveInverterControlLimit;
    } | null = null;
    private lastAppliedInverterConfiguration: InverterConfiguration | null =
        null;
    private onControl: (
        inverterConfiguration: InverterConfiguration,
    ) => Promise<void>;

    // instantaneous DER and site readings are unrealiable since they are sampled at different intervals
    // due to the nature of control influencing the measurements which create a feedback loop
    // we don't want to rely on the latest readings to make decisions since it will lead to oscillating control values
    // we take a time weighted average of the last few seconds to smooth out the control values
    private secondsToSample: number;
    private controlFrequencyMinimumSeconds: number;

    constructor({
        config,
        limiters,
        onControl,
    }: {
        config: Config;
        limiters: Limiters;
        onControl: (
            inverterConfiguration: InverterConfiguration,
        ) => Promise<void>;
    }) {
        this.publish = new Publish({ config });
        this.secondsToSample = config.inverterControl.sampleSeconds;
        this.controlFrequencyMinimumSeconds =
            config.inverterControl.controlFrequencyMinimumSeconds;
        this.limiters = limiters;
        this.logger = pinoLogger.child({ module: 'InverterController' });
        this.onControl = onControl;

        this.updateControlLimitsLoop();
        void this.applyControlLoop();
    }

    updateDerSample(derSample: DerSample) {
        this.cachedDerSample.push(derSample);

        this.updateLoadWatts();
    }

    updateSiteSample(siteSample: SiteSample) {
        this.cachedSiteSample.push(siteSample);

        this.updateLoadWatts();
    }

    public get getLoadWatts() {
        return this.loadWattsCache;
    }

    public get getControlLimits() {
        return this.controlLimitsCache;
    }

    public get getLastAppliedInverterConfiguration() {
        return this.lastAppliedInverterConfiguration;
    }

    private updateLoadWatts() {
        const lastSolarWatts = this.cachedDerSample.get().at(-1)?.realPower.net;
        const lastSiteWatts = this.cachedSiteSample.get().at(-1)?.realPower.net;

        if (lastSolarWatts === undefined || lastSiteWatts === undefined) {
            this.loadWattsCache = null;
            return;
        }

        const loadWatts = lastSolarWatts + lastSiteWatts;

        this.loadWattsCache = loadWatts;

        writeLoadWatts(loadWatts);
    }

    private updateControlLimitsLoop() {
        const start = performance.now();

        const controlLimitsByLimiter = objectFromEntriesWithType(
            objectEntriesWithType(this.limiters).map(([key, limiter]) => [
                key,
                limiter?.getInverterControlLimit() ?? null,
            ]),
        );

        const activeInverterControlLimit = getActiveInverterControlLimit(
            Object.values(controlLimitsByLimiter),
        );

        writeActiveControlLimit({ limit: activeInverterControlLimit });

        this.publish.onActiveInverterControlLimit({
            limit: activeInverterControlLimit,
        });

        this.controlLimitsCache = {
            controlLimitsByLimiter,
            activeInverterControlLimit,
        };

        const end = performance.now();
        const duration = end - start;

        this.logger.trace(
            { duration, ...this.controlLimitsCache },
            'control limits loop updated',
        );

        writeLatency({ field: 'controlLimitsLoop', duration });

        // update at most every 1 second
        const delay = Math.max(1000 - duration, 0);

        setTimeout(() => {
            void this.updateControlLimitsLoop();
        }, delay);
    }

    private async applyControlLoop() {
        const start = performance.now();

        const inverterConfiguration = this.getInverterConfiguration();

        try {
            if (!inverterConfiguration) {
                this.logger.warn('Inverter configuration is not calculated');
            } else {
                await this.onControl(inverterConfiguration);

                this.logger.info(
                    {
                        activeInverterControlLimit:
                            this.controlLimitsCache?.activeInverterControlLimit,
                        inverterConfiguration,
                    },
                    'Set inverter control values',
                );

                this.lastAppliedInverterConfiguration = inverterConfiguration;
            }
        } catch (error) {
            this.logger.error(error, 'Failed to set inverter control values');
        } finally {
            const end = performance.now();
            const duration = end - start;

            this.logger.trace({ duration }, 'Inverter control loop duration');

            writeLatency({ field: 'applyControlLoop', duration });

            const delay = Math.max(
                this.controlFrequencyMinimumSeconds * 1000 - duration,
                0,
            );

            setTimeout(() => {
                void this.applyControlLoop();
            }, delay);
        }
    }

    private getInverterConfiguration(): InverterConfiguration | null {
        if (!this.controlLimitsCache) {
            this.logger.warn('Control limits not available');
            return null;
        }

        const now = new Date();

        const recentDerSamples = this.cachedDerSample
            .get()
            .filter(
                (sample) =>
                    differenceInSeconds(now, sample.date) <=
                    this.secondsToSample,
            );

        const recentSiteSamples = this.cachedSiteSample
            .get()
            .filter(
                (sample) =>
                    differenceInSeconds(now, sample.date) <=
                    this.secondsToSample,
            );

        if (!recentDerSamples.length || !recentSiteSamples.length) {
            this.logger.warn('No recent DER or site samples');
            return null;
        }

        const averagedSolarWatts = timeWeightedAverage(
            recentDerSamples.map((s) => ({
                timestamp: s.date,
                value: s.realPower.net,
            })),
        );
        const averagedSiteWatts = timeWeightedAverage(
            recentSiteSamples.map((s) => ({
                timestamp: s.date,
                value: s.realPower.net,
            })),
        );
        const averagedNameplateMaxW = timeWeightedAverage(
            recentDerSamples.map((s) => ({
                timestamp: s.date,
                value: s.nameplate.maxW,
            })),
        );

        const maxInvertersCount = Math.max(
            ...recentDerSamples.map((sample) => sample.invertersCount),
        );

        const rampedInverterConfiguration = ((): InverterConfiguration => {
            const configuration = calculateInverterConfiguration({
                activeInverterControlLimit:
                    this.controlLimitsCache.activeInverterControlLimit,
                nameplateMaxW: averagedNameplateMaxW,
                siteWatts: averagedSiteWatts,
                solarWatts: averagedSolarWatts,
                maxInvertersCount,
            });

            switch (configuration.type) {
                case 'disconnect':
                    return configuration;
                case 'limit': {
                    // ramp the target solar power ratio to prevent sudden changes (e.g. 0% > 100% > 0%)
                    // prevents inverter from potential hardware damage
                    // also prevents feedback cycle with batteries constantly switching between charge/discharge
                    const previousTarget = ((): {
                        targetSolarWatts: number;
                        targetSolarPowerRatio: number;
                    } | null => {
                        if (!this.lastAppliedInverterConfiguration) {
                            return null;
                        }

                        switch (this.lastAppliedInverterConfiguration.type) {
                            case 'disconnect':
                                // slowly ramp from 0 if previously disconnected
                                return {
                                    targetSolarWatts: 0,
                                    targetSolarPowerRatio: 0,
                                };
                            case 'limit':
                                return this.lastAppliedInverterConfiguration;
                        }
                    })();

                    if (previousTarget === null) {
                        return configuration;
                    }

                    // max 10% change
                    const maxChange = 0.1;

                    const rampedTargetSolarWatts = cappedChange({
                        previousValue: previousTarget.targetSolarWatts,
                        targetValue: configuration.targetSolarWatts,
                        maxChange,
                    });

                    const rampedTargetSolarPowerRatio = cappedChange({
                        previousValue: previousTarget.targetSolarPowerRatio,
                        targetValue: configuration.targetSolarPowerRatio,
                        maxChange,
                    });

                    return {
                        type: 'limit',
                        invertersCount: configuration.invertersCount,
                        targetSolarWatts: rampedTargetSolarWatts,
                        targetSolarPowerRatio: rampedTargetSolarPowerRatio,
                    };
                }
            }
        })();

        return rampedInverterConfiguration;
    }
}

export function calculateInverterConfiguration({
    activeInverterControlLimit,
    siteWatts,
    solarWatts,
    nameplateMaxW,
    maxInvertersCount,
}: {
    activeInverterControlLimit: ActiveInverterControlLimit;
    siteWatts: number;
    solarWatts: number;
    nameplateMaxW: number;
    maxInvertersCount: number;
}): InverterConfiguration {
    const logger = pinoLogger.child({
        module: 'calculateInverterConfiguration',
    });

    logger.trace(
        {
            activeInverterControlLimit,
        },
        'activeInverterControlLimit',
    );

    const energize =
        activeInverterControlLimit.opModEnergize?.value ??
        defaultValues.opModEnergize;

    const connect =
        activeInverterControlLimit.opModConnect?.value ??
        defaultValues.opModConnect;

    const disconnect = energize === false || connect === false;

    const exportLimitWatts =
        activeInverterControlLimit.opModExpLimW?.value ??
        defaultValues.opModExpLimW;

    const generationLimitWatts =
        activeInverterControlLimit.opModGenLimW?.value ??
        defaultValues.opModGenLimW;

    const exportLimitTargetSolarWatts = calculateTargetSolarWatts({
        exportLimitWatts,
        siteWatts,
        solarWatts,
    });

    // the limits need to be applied together
    // take the lesser of the export limit target solar watts or generation limit
    const targetSolarWatts = Math.min(
        exportLimitTargetSolarWatts,
        generationLimitWatts,
    );

    const targetSolarPowerRatio = calculateTargetSolarPowerRatio({
        nameplateMaxW,
        targetSolarWatts,
    });

    writeInverterControllerPoints({
        disconnect,
        siteWatts,
        solarWatts,
        exportLimitWatts,
        exportLimitTargetSolarWatts,
        generationLimitWatts,
        targetSolarWatts,
        targetSolarPowerRatio,
    });

    logger.trace(
        {
            disconnect,
            siteWatts,
            solarWatts,
            exportLimitWatts,
            exportLimitTargetSolarWatts,
            generationLimitWatts,
            targetSolarWatts,
            targetSolarPowerRatio: roundToDecimals(targetSolarPowerRatio, 4),
        },
        'calculated values',
    );

    if (energize === false || connect === false) {
        return { type: 'disconnect' };
    }

    return {
        type: 'limit',
        invertersCount: maxInvertersCount,
        targetSolarWatts,
        targetSolarPowerRatio: roundToDecimals(targetSolarPowerRatio, 4),
    };
}

export function getWMaxLimPctFromTargetSolarPowerRatio({
    targetSolarPowerRatio,
    controlsModel,
}: {
    targetSolarPowerRatio: number;
    controlsModel: Pick<ControlsModel, 'WMaxLimPct_SF'>;
}) {
    return Math.round(
        numberWithPow10(
            Decimal.min(
                new Decimal(targetSolarPowerRatio),
                1, // cap maximum to 1
            )
                .times(100)
                .toNumber(),
            -controlsModel.WMaxLimPct_SF,
        ),
    );
}

export function calculateTargetSolarPowerRatio({
    nameplateMaxW,
    targetSolarWatts,
}: {
    nameplateMaxW: number;
    targetSolarWatts: number;
}) {
    if (nameplateMaxW === 0) {
        return 0;
    }

    const targetPowerRatio = new Decimal(targetSolarWatts).div(nameplateMaxW);

    // cap the target power ratio to 1.0
    return targetPowerRatio.clamp(0, 1).toNumber();
}

// calculate the target solar power to meet the export limit
// note: this may return a value higher than what the PV/inverter is able to produce
// we don't want to make any assumptions about the max capabilities of the inverter due to overclocking
export function calculateTargetSolarWatts({
    solarWatts,
    siteWatts,
    exportLimitWatts,
}: {
    solarWatts: number;
    // the power usage at the site
    // positive = import power
    // negative = export power
    siteWatts: number;
    exportLimitWatts: number;
}) {
    const changeToMeetExportLimit = new Decimal(-siteWatts).sub(
        exportLimitWatts,
    );
    const solarTarget = new Decimal(solarWatts).sub(changeToMeetExportLimit);

    return solarTarget.toNumber();
}

export type ActiveInverterControlLimit = {
    opModEnergize:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    opModConnect:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    opModGenLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModExpLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModImpLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModLoadLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
};

export function getActiveInverterControlLimit(
    controlLimits: (InverterControlLimit | null)[],
): ActiveInverterControlLimit {
    let opModEnergize: ActiveInverterControlLimit['opModEnergize'] = undefined;
    let opModConnect: ActiveInverterControlLimit['opModConnect'] = undefined;
    let opModGenLimW: ActiveInverterControlLimit['opModGenLimW'] = undefined;
    let opModExpLimW: ActiveInverterControlLimit['opModExpLimW'] = undefined;
    let opModImpLimW: ActiveInverterControlLimit['opModImpLimW'] = undefined;
    let opModLoadLimW: ActiveInverterControlLimit['opModLoadLimW'] = undefined;

    for (const controlLimit of controlLimits) {
        if (!controlLimit) {
            continue;
        }

        if (controlLimit.opModEnergize !== undefined) {
            if (
                opModEnergize === undefined ||
                // false overrides true
                (opModEnergize.value === true &&
                    controlLimit.opModEnergize === false)
            ) {
                opModEnergize = {
                    source: controlLimit.source,
                    value: controlLimit.opModEnergize,
                };
            }
        }

        if (controlLimit.opModConnect !== undefined) {
            if (
                opModConnect === undefined ||
                // false overrides true
                (opModConnect.value === true &&
                    controlLimit.opModConnect === false)
            ) {
                opModConnect = {
                    source: controlLimit.source,
                    value: controlLimit.opModConnect,
                };
            }
        }

        if (controlLimit.opModGenLimW !== undefined) {
            if (
                opModGenLimW === undefined ||
                // take the lesser value
                controlLimit.opModGenLimW < opModGenLimW.value
            ) {
                opModGenLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModGenLimW,
                };
            }
        }

        if (controlLimit.opModExpLimW !== undefined) {
            if (
                opModExpLimW === undefined ||
                // take the lesser value
                controlLimit.opModExpLimW < opModExpLimW.value
            ) {
                opModExpLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModExpLimW,
                };
            }
        }

        if (controlLimit.opModImpLimW !== undefined) {
            if (
                opModImpLimW === undefined ||
                // take the lesser value
                controlLimit.opModImpLimW < opModImpLimW.value
            ) {
                opModImpLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModImpLimW,
                };
            }
        }

        if (controlLimit.opModLoadLimW !== undefined) {
            if (
                opModLoadLimW === undefined ||
                // take the lesser value
                controlLimit.opModLoadLimW < opModLoadLimW.value
            ) {
                opModLoadLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModLoadLimW,
                };
            }
        }
    }

    return {
        opModEnergize,
        opModConnect,
        opModGenLimW,
        opModExpLimW,
        opModImpLimW,
        opModLoadLimW,
    };
}
