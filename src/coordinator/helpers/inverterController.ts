import type { ControlType } from '../../sep2/helpers/controlScheduler.js';
import { type ControlsModel } from '../../sunspec/models/controls.js';
import { Decimal } from 'decimal.js';
import { numberWithPow10, roundToDecimals } from '../../helpers/number.js';
import { type Logger } from 'pino';
import { logger as pinoLogger } from '../../helpers/logger.js';
import { writeInverterControllerPoints } from '../../helpers/influxdb.js';
import type { SiteSample } from '../../meters/siteSample.js';
import type { Limiters } from '../../limiters/index.js';
import {
    objectEntriesWithType,
    objectFromEntriesWithType,
} from '../../helpers/object.js';
import type { LimiterKeys } from '../../helpers/config.js';
import { cappedChange } from '../../helpers/math.js';
import type { DerSample } from './derSample.js';
import { CappedArrayStack } from '../../helpers/cappedArrayStack.js';
import { timeWeightedAverage } from '../../helpers/timeWeightedAverage.js';

export type SupportedControlTypes = Extract<
    ControlType,
    'opModExpLimW' | 'opModGenLimW' | 'opModEnergize' | 'opModConnect'
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
};

export type InverterConfiguration =
    | { type: 'disconnect' }
    | {
          type: 'limit';
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

type InverterControllerData = {
    loadWatts: number;
    controlLimitsByLimiter: Record<LimiterKeys, InverterControlLimit | null>;
    activeInverterControlLimit: ActiveInverterControlLimit;
    inverterConfiguration: InverterConfiguration;
};

export class InverterController {
    private cachedDerSample = new CappedArrayStack<DerSample>({ limit: 10 });
    private cachedSiteSample = new CappedArrayStack<SiteSample>({ limit: 10 });
    private logger: Logger;
    private limiters: Limiters;
    private cachedData: InverterControllerData | null = null;
    private onControl: (
        inverterConfiguration: InverterConfiguration,
    ) => Promise<void>;

    constructor({
        limiters,
        onControl,
    }: {
        limiters: Limiters;
        onControl: (
            inverterConfiguration: InverterConfiguration,
        ) => Promise<void>;
    }) {
        this.logger = pinoLogger.child({ module: 'InverterController' });

        this.limiters = limiters;
        this.onControl = onControl;

        void this.controlLoop();
    }

    updateDerSample(derSample: DerSample) {
        this.cachedDerSample.push(derSample);
    }

    updateSiteSample(siteSample: SiteSample) {
        this.cachedSiteSample.push(siteSample);

        this.updateInverterControlValues();
    }

    public get getCachedData() {
        return this.cachedData;
    }

    private async controlLoop() {
        const start = performance.now();

        // make a copy of this value as it might change during the control loop
        const cachedData = this.cachedData ? { ...this.cachedData } : null;

        try {
            if (!cachedData) {
                this.logger.warn(
                    'Inverter data is not cached, cannot set inverter controls yet. Wait for next loop.',
                );
            } else {
                await this.onControl(cachedData.inverterConfiguration);

                this.logger.info(
                    {
                        activeInverterControlLimit:
                            cachedData.activeInverterControlLimit,
                        inverterConfiguration: cachedData.inverterConfiguration,
                    },
                    'Set inverter control values',
                );
            }
        } catch (error) {
            this.logger.error(error, 'Failed to set inverter control values');
        } finally {
            const end = performance.now();
            const duration = end - start;

            this.logger.trace({ duration }, 'Inverter control loop duration');

            // update the inverter at most every 1 second
            const delay = Math.max(1000 - duration, 0);

            setTimeout(() => {
                void this.controlLoop();
            }, delay);
        }
    }

    private updateInverterControlValues() {
        const derSamples = this.cachedDerSample.get();
        const siteSamples = this.cachedSiteSample.get();

        if (!derSamples.length || !siteSamples.length) {
            return;
        }

        const controlLimitsByLimiter = objectFromEntriesWithType(
            objectEntriesWithType(this.limiters).map(([key, limiter]) => [
                key,
                limiter?.getInverterControlLimit() ?? null,
            ]),
        );

        const activeInverterControlLimit = getActiveInverterControlLimit(
            Object.values(controlLimitsByLimiter),
        );

        const averagedSolarWatts = timeWeightedAverage(
            derSamples.map((s) => ({
                timestamp: s.date,
                value: s.realPower.net,
            })),
        );
        const averagedSiteWatts = timeWeightedAverage(
            siteSamples.map((s) => ({
                timestamp: s.date,
                value: s.realPower.net,
            })),
        );
        const averagedNameplateMaxW = timeWeightedAverage(
            derSamples.map((s) => ({
                timestamp: s.date,
                value: s.nameplate.maxW,
            })),
        );

        const loadWatts = averagedSolarWatts + averagedSiteWatts;

        const inverterConfiguration = ((): InverterConfiguration => {
            const configuration = calculateInverterConfiguration({
                activeInverterControlLimit,
                nameplateMaxW: averagedNameplateMaxW,
                siteWatts: averagedSiteWatts,
                solarWatts: averagedSolarWatts,
            });

            switch (configuration.type) {
                case 'disconnect':
                    return configuration;
                case 'limit': {
                    // ramp the target solar power ratio to prevent sudden changes (e.g. 0% > 100% > 0%)
                    // prevents inverter from potential hardware damage
                    // also prevents feedback cycle with batteries constantly switching between charge/discharge
                    const previousTargetSolarPowerRatio = (() => {
                        if (!this.cachedData) {
                            return null;
                        }

                        switch (this.cachedData.inverterConfiguration.type) {
                            case 'disconnect':
                                // slowly ramp from 0 if previously disconnected
                                return 0;
                            case 'limit':
                                return this.cachedData.inverterConfiguration
                                    .targetSolarPowerRatio;
                        }
                    })();

                    if (previousTargetSolarPowerRatio === null) {
                        return configuration;
                    }

                    const rampedTargetSolarPowerRatio = cappedChange({
                        previousValue: previousTargetSolarPowerRatio,
                        targetValue: configuration.targetSolarPowerRatio,
                        // max 10% change
                        maxChange: 0.1,
                    });

                    return {
                        type: 'limit',
                        targetSolarPowerRatio: rampedTargetSolarPowerRatio,
                    };
                }
            }
        })();

        this.cachedData = {
            loadWatts,
            controlLimitsByLimiter,
            activeInverterControlLimit,
            inverterConfiguration,
        };

        this.logger.debug(
            {
                ...this.cachedData,
            },
            'Updated inverter controller data',
        );
    }
}

export function calculateInverterConfiguration({
    activeInverterControlLimit,
    siteWatts,
    solarWatts,
    nameplateMaxW,
}: {
    activeInverterControlLimit: ActiveInverterControlLimit;
    siteWatts: number;
    solarWatts: number;
    nameplateMaxW: number;
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
    const changeToMeetExportLimit = new Decimal(-siteWatts).plus(
        -exportLimitWatts,
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
};

export function getActiveInverterControlLimit(
    controlLimits: (InverterControlLimit | null)[],
): ActiveInverterControlLimit {
    let opModEnergize: ActiveInverterControlLimit['opModEnergize'] = undefined;
    let opModConnect: ActiveInverterControlLimit['opModConnect'] = undefined;
    let opModGenLimW: ActiveInverterControlLimit['opModGenLimW'] = undefined;
    let opModExpLimW: ActiveInverterControlLimit['opModExpLimW'] = undefined;

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
    }

    return {
        opModEnergize,
        opModConnect,
        opModGenLimW,
        opModExpLimW,
    };
}
