import type { ControlType } from '../../sep2/helpers/controlScheduler.js';
import {
    Conn,
    OutPFSet_Ena,
    VArPct_Ena,
    WMaxLim_Ena,
    type ControlsModel,
    type ControlsModelWrite,
} from '../../sunspec/models/controls.js';
import type { InverterSunSpecConnection } from '../../sunspec/connection/inverter.js';
import { Decimal } from 'decimal.js';
import {
    averageNumbersArray,
    numberWithPow10,
    roundToDecimals,
    sumNumbersArray,
} from '../../helpers/number.js';
import { getTotalFromPerPhaseNetOrNoPhaseMeasurement } from '../../helpers/measurement.js';
import { type Logger } from 'pino';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { RampRateHelper } from './rampRate.js';
import { writeInverterControllerPoints } from '../../helpers/influxdb.js';
import type { LimiterType } from './limiter.js';
import type { SiteSample } from '../../meters/siteSample.js';
import type { InvertersPolledData } from './inverterData.js';

export type SupportedControlTypes = Extract<
    ControlType,
    'opModExpLimW' | 'opModGenLimW' | 'opModEnergize' | 'opModConnect'
>;

export type InverterControlLimit = {
    opModEnergize: boolean | undefined;
    opModConnect: boolean | undefined;
    opModGenLimW: number | undefined;
    opModExpLimW: number | undefined;
};

type InverterConfiguration =
    | { type: 'deenergize' }
    | {
          type: 'limit';
          currentPowerRatio: number;
          targetSolarPowerRatio: number;
          rampedTargetSolarPowerRatio: number;
      };

const defaultValues = {
    opModGenLimW: Number.MAX_SAFE_INTEGER,
    opModLoadLimW: Number.MAX_SAFE_INTEGER,
    opModExpLimW: 1500,
    opModImpLimW: 1500,
    opModEnergize: true,
    opModConnect: true,
};

export class InverterController {
    private inverterConnections: InverterSunSpecConnection[];
    private cachedInvertersData: InvertersPolledData | null = null;
    private cachedSiteSample: SiteSample | null = null;
    private applyControl: boolean;
    private logger: Logger;
    private rampRateHelper: RampRateHelper;
    private limiters: LimiterType[];

    constructor({
        invertersConnections,
        applyControl,
        rampRateHelper,
        limiters,
    }: {
        invertersConnections: InverterSunSpecConnection[];
        applyControl: boolean;
        rampRateHelper: RampRateHelper;
        limiters: LimiterType[];
    }) {
        this.logger = pinoLogger.child({ module: 'InverterController' });

        this.applyControl = applyControl;
        this.inverterConnections = invertersConnections;
        this.rampRateHelper = rampRateHelper;
        this.limiters = limiters;

        void this.startLoop();
    }

    updateSunSpecInverterData(data: InvertersPolledData) {
        this.logger.debug('Received inverter data, updating inverter controls');
        this.cachedInvertersData = data;
    }

    updateSiteSample(siteSample: SiteSample) {
        this.logger.debug('Received site sample, updating inverter controls');
        this.cachedSiteSample = siteSample;
    }

    private getActiveInverterControlLimit(): InverterControlLimit {
        const controlLimits = this.limiters.map((controlLimit) =>
            controlLimit.getInverterControlLimit(),
        );

        return getAggregatedInverterControlLimit(controlLimits);
    }

    private async startLoop() {
        const start = performance.now();

        try {
            await this.updateInverterControlValues();
        } catch (error) {
            this.logger.error(
                { error },
                'Failed to push inverter control values',
            );
        } finally {
            const end = performance.now();
            const duration = end - start;

            // update the inverter at most every 1 second
            const delay = Math.max(1000 - duration, 0);

            setTimeout(() => {
                void this.startLoop();
            }, delay);
        }
    }

    private async updateInverterControlValues() {
        if (!this.cachedInvertersData) {
            this.logger.warn(
                'Inverter data is not cached, cannot update inverter controls yet. Wait for next loop.',
            );
            return;
        }

        if (!this.cachedSiteSample) {
            this.logger.warn(
                'Site monitoring data is not cached, cannot update inverter controls yet. Wait for next loop.',
            );
            return;
        }

        const getActiveInverterControlLimit =
            this.getActiveInverterControlLimit();

        const inverterConfiguration = calculateInverterConfiguration({
            activeControlLimit: getActiveInverterControlLimit,
            invertersData: this.cachedInvertersData,
            siteSample: this.cachedSiteSample,
            rampRateHelper: this.rampRateHelper,
        });

        this.logger.info(
            {
                getActiveInverterControlLimit,
                inverterConfiguration,
            },
            'Updating inverter control values',
        );

        await Promise.all(
            this.inverterConnections.map(async (inverter, index) => {
                // assume the inverter data is in the same order as the connections
                const inverterData =
                    this.cachedInvertersData?.invertersData[index];

                if (!inverterData) {
                    throw new Error('Inverter data not found');
                }

                const writeControlsModel =
                    generateControlsModelWriteFromInverterConfiguration({
                        inverterConfiguration,
                        controlsModel: inverterData.controls,
                    });

                if (this.applyControl) {
                    try {
                        await inverter.writeControlsModel(writeControlsModel);
                    } catch (error) {
                        this.logger.error(
                            { error },
                            'Error writing inverter controls value',
                        );
                    }
                }
            }),
        );
    }
}

export function calculateInverterConfiguration({
    activeControlLimit,
    invertersData,
    siteSample,
    rampRateHelper,
}: {
    activeControlLimit: InverterControlLimit;
    invertersData: InvertersPolledData;
    siteSample: SiteSample;
    rampRateHelper: RampRateHelper;
}): InverterConfiguration {
    const logger = pinoLogger.child({ module: 'calculateDynamicExportConfig' });

    logger.trace(
        {
            activeDerControlBaseValues: activeControlLimit,
        },
        'activeDerControlBaseValue',
    );

    const energize =
        activeControlLimit.opModEnergize ?? defaultValues.opModEnergize;
    const connect =
        activeControlLimit.opModConnect ?? defaultValues.opModConnect;
    const deenergize = energize === false || connect === false;

    const siteWatts = getTotalFromPerPhaseNetOrNoPhaseMeasurement(
        siteSample.realPower,
    );
    const solarWatts = getTotalFromPerPhaseNetOrNoPhaseMeasurement(
        invertersData.derSample.realPower,
    );

    const exportLimitWatts =
        activeControlLimit.opModExpLimW ?? defaultValues.opModExpLimW;

    const generationLimitWatts =
        activeControlLimit.opModGenLimW ?? defaultValues.opModGenLimW;

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

    const currentPowerRatio = getCurrentPowerRatio({
        inverters: invertersData.invertersData,
        currentSolarWatts: solarWatts,
    });

    const targetSolarPowerRatio = calculateTargetSolarPowerRatio({
        inverters: invertersData.invertersData,
        targetSolarWatts,
    });

    const rampedTargetSolarPowerRatio = rampRateHelper.calculateRampValue({
        currentPowerRatio,
        targetPowerRatio: targetSolarPowerRatio,
    });

    writeInverterControllerPoints({
        deenergize,
        siteWatts,
        solarWatts,
        exportLimitWatts,
        exportLimitTargetSolarWatts,
        rampedTargetSolarPowerRatio,
        generationLimitWatts,
        targetSolarWatts,
        currentPowerRatio,
        targetSolarPowerRatio,
    });

    logger.trace(
        {
            deenergize,
            siteWatts,
            solarWatts,
            exportLimitWatts,
            exportLimitTargetSolarWatts,
            rampedTargetSolarPowerRatio,
            generationLimitWatts,
            targetSolarWatts,
            currentPowerRatio,
            targetSolarPowerRatio,
        },
        'calculated values',
    );

    if (energize === false || connect === false) {
        return { type: 'deenergize' };
    }

    return {
        type: 'limit',
        currentPowerRatio: roundToDecimals(currentPowerRatio, 4),
        targetSolarPowerRatio: roundToDecimals(targetSolarPowerRatio, 4),
        rampedTargetSolarPowerRatio: roundToDecimals(
            rampedTargetSolarPowerRatio,
            4,
        ),
    };
}

export function generateControlsModelWriteFromInverterConfiguration({
    inverterConfiguration,
    controlsModel,
}: {
    inverterConfiguration: InverterConfiguration;
    controlsModel: ControlsModel;
}): ControlsModelWrite {
    switch (inverterConfiguration.type) {
        case 'deenergize':
            return {
                ...controlsModel,
                Conn: Conn.DISCONNECT,
                // revert Conn in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                Conn_RvrtTms: 60,
                WMaxLim_Ena: WMaxLim_Ena.DISABLED,
                // set value to 0 to gracefully handle re-energising and calculating target power ratio
                WMaxLimPct: getWMaxLimPctFromTargetSolarPowerRatio({
                    targetSolarPowerRatio: 0,
                    controlsModel,
                }),
                VArPct_Ena: VArPct_Ena.DISABLED,
                OutPFSet_Ena: OutPFSet_Ena.DISABLED,
            };
        case 'limit':
            return {
                ...controlsModel,
                Conn: Conn.CONNECT,
                WMaxLim_Ena: WMaxLim_Ena.ENABLED,
                WMaxLimPct: getWMaxLimPctFromTargetSolarPowerRatio({
                    targetSolarPowerRatio:
                        inverterConfiguration.rampedTargetSolarPowerRatio,
                    controlsModel,
                }),
                // revert WMaxLimtPct in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                WMaxLimPct_RvrtTms: 60,
                VArPct_Ena: VArPct_Ena.DISABLED,
                OutPFSet_Ena: OutPFSet_Ena.DISABLED,
            };
    }
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

export function getCurrentPowerRatio({
    inverters,
    currentSolarWatts,
}: {
    inverters: {
        inverter: Pick<
            InvertersPolledData['invertersData'][number]['inverter'],
            'realPower'
        >;
        nameplate: Pick<
            InvertersPolledData['invertersData'][number]['nameplate'],
            'maxW'
        >;
        controls: Pick<
            InvertersPolledData['invertersData'][number]['controls'],
            'WMaxLim_Ena' | 'WMaxLimPct' | 'WMaxLimPct_SF'
        >;
    }[];
    currentSolarWatts: number;
}) {
    return averageNumbersArray(
        inverters.map(({ controls, inverter, nameplate }, invertersIndex) => {
            // if the WMaxLim_Ena is not enabled, we are not yet controlling the inverter
            // we're not sure if the inverter is under any control that is invisible to SunSpec (e.g. export limit) that might be affecting the output
            // so we can't know definitely what the "actual" power ratio is
            // this is a dangerous scenario because if we miscalculate the power ratio at the first instance of control, we might exceed the export limit
            // the most conservative estimate we can make is the current solar / nameplate ratio which assumes a 100% efficiency
            // because it will never be 100% efficient, this means that we should always underestimate the power ratio
            // which is a safe assumption, but we hope future update cycles will find the "correct" power ratio
            if (controls.WMaxLim_Ena !== WMaxLim_Ena.ENABLED) {
                const estimatedPowerRatio = Math.min(
                    inverter.realPower / nameplate.maxW,
                    1, // cap maximum to 1 (possible due to inverter overclocking)
                );

                pinoLogger.debug(
                    {
                        estimatedPowerRatio: roundToDecimals(
                            estimatedPowerRatio,
                            4,
                        ),
                        currentSolarWatts,
                        nameplate,
                        invertersIndex,
                    },
                    'WMaxLim_Ena is not enabled, estimated power ratio',
                );

                return estimatedPowerRatio;
            }

            return (
                // the value is expressed from 0-100, divide to get ratio
                numberWithPow10(controls.WMaxLimPct, controls.WMaxLimPct_SF) /
                100
            );
        }),
    );
}

export function calculateTargetSolarPowerRatio({
    inverters,
    targetSolarWatts,
}: {
    inverters: {
        nameplate: Pick<
            InvertersPolledData['invertersData'][number]['nameplate'],
            'maxW'
        >;
    }[];
    targetSolarWatts: number;
}) {
    const nameplateWattsTotal = sumNumbersArray(
        inverters.map(({ nameplate }) => nameplate.maxW),
    );

    if (nameplateWattsTotal === 0) {
        return 0;
    }

    const targetPowerRatio = new Decimal(targetSolarWatts).div(
        sumNumbersArray(inverters.map(({ nameplate }) => nameplate.maxW)),
    );

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

export function getAggregatedInverterControlLimit(
    controlLimits: InverterControlLimit[],
) {
    let opModEnergize: boolean | undefined = undefined;
    let opModConnect: boolean | undefined = undefined;
    let opModGenLimW: number | undefined = undefined;
    let opModExpLimW: number | undefined = undefined;

    for (const controlLimit of controlLimits) {
        if (controlLimit.opModEnergize !== undefined) {
            if (opModEnergize === undefined) {
                opModEnergize = controlLimit.opModEnergize;
            } else {
                opModEnergize = opModEnergize && controlLimit.opModEnergize;
            }
        }

        if (controlLimit.opModConnect !== undefined) {
            if (opModConnect === undefined) {
                opModConnect = controlLimit.opModConnect;
            } else {
                opModConnect = opModConnect && controlLimit.opModConnect;
            }
        }

        if (controlLimit.opModGenLimW !== undefined) {
            if (
                opModGenLimW === undefined ||
                controlLimit.opModGenLimW < opModGenLimW
            ) {
                opModGenLimW = controlLimit.opModGenLimW;
            }
        }

        if (controlLimit.opModExpLimW !== undefined) {
            if (
                opModExpLimW === undefined ||
                controlLimit.opModExpLimW < opModExpLimW
            ) {
                opModExpLimW = controlLimit.opModExpLimW;
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
