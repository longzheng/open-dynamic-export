import type { ControlType } from '../../sep2/helpers/controlScheduler.js';
import { type ControlsModel } from '../../sunspec/models/controls.js';
import { Decimal } from 'decimal.js';
import {
    numberWithPow10,
    roundToDecimals,
    sumNumbersArray,
} from '../../helpers/number.js';
import { getTotalFromPerPhaseNetOrNoPhaseMeasurement } from '../../helpers/measurement.js';
import { type Logger } from 'pino';
import { logger as pinoLogger } from '../../helpers/logger.js';
import { writeInverterControllerPoints } from '../../helpers/influxdb.js';
import type { SiteSample } from '../../meters/siteSample.js';
import type { InvertersData } from './inverterSample.js';
import type { Limiters } from '../../limiters/index.js';
import {
    objectEntriesWithType,
    objectFromEntriesWithType,
} from '../../helpers/object.js';
import type { LimiterKeys } from '../../helpers/config.js';

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

export class InverterController {
    private cachedInvertersData: InvertersData | null = null;
    private cachedSiteSample: SiteSample | null = null;
    private logger: Logger;
    private limiters: Limiters;
    private cachedData: {
        controlLimitsByLimiter: Record<
            LimiterKeys,
            InverterControlLimit | null
        >;
        activeInverterControlLimit: InverterControlLimit;
        inverterConfiguration: InverterConfiguration;
    } | null = null;
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

        void this.startLoop();
    }

    updateSunSpecInverterData(data: InvertersData) {
        this.logger.debug('Received inverter data, updating inverter controls');
        this.cachedInvertersData = data;
    }

    updateSiteSample(siteSample: SiteSample) {
        this.logger.debug('Received site sample, updating inverter controls');
        this.cachedSiteSample = siteSample;
    }

    public get getCachedData() {
        return this.cachedData;
    }

    private async startLoop() {
        const start = performance.now();

        try {
            await this.updateInverterControlValues();
        } catch (error) {
            this.logger.error(error, 'Failed to push inverter control values');
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

        const controlLimitsByLimiter = objectFromEntriesWithType(
            objectEntriesWithType(this.limiters).map(([key, limiter]) => [
                key,
                limiter?.getInverterControlLimit() ?? null,
            ]),
        );

        const activeInverterControlLimit = getAggregatedInverterControlLimit(
            Object.values(controlLimitsByLimiter),
        );

        const inverterConfiguration = calculateInverterConfiguration({
            activeInverterControlLimit,
            invertersData: this.cachedInvertersData,
            siteSample: this.cachedSiteSample,
        });

        this.cachedData = {
            controlLimitsByLimiter,
            activeInverterControlLimit,
            inverterConfiguration,
        };

        this.logger.info(
            {
                activeInverterControlLimit,
                inverterConfiguration,
            },
            'Updating inverter control values',
        );

        await this.onControl(inverterConfiguration);
    }
}

export function calculateInverterConfiguration({
    activeInverterControlLimit,
    invertersData,
    siteSample,
}: {
    activeInverterControlLimit: InverterControlLimit;
    invertersData: InvertersData;
    siteSample: SiteSample;
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
        activeInverterControlLimit.opModEnergize ?? defaultValues.opModEnergize;

    const connect =
        activeInverterControlLimit.opModConnect ?? defaultValues.opModConnect;

    const disconnect = energize === false || connect === false;

    const siteWatts = getTotalFromPerPhaseNetOrNoPhaseMeasurement(
        siteSample.realPower,
    );

    const solarWatts = getTotalFromPerPhaseNetOrNoPhaseMeasurement(
        invertersData.derSample.realPower,
    );

    const exportLimitWatts =
        activeInverterControlLimit.opModExpLimW ?? defaultValues.opModExpLimW;

    const generationLimitWatts =
        activeInverterControlLimit.opModGenLimW ?? defaultValues.opModGenLimW;

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
        inverters: invertersData.invertersData,
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
            targetSolarPowerRatio,
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
    inverters,
    targetSolarWatts,
}: {
    inverters: {
        nameplate: Pick<
            InvertersData['invertersData'][number]['nameplate'],
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
    controlLimits: (InverterControlLimit | null)[],
) {
    let opModEnergize: boolean | undefined = undefined;
    let opModConnect: boolean | undefined = undefined;
    let opModGenLimW: number | undefined = undefined;
    let opModExpLimW: number | undefined = undefined;

    for (const controlLimit of controlLimits) {
        if (!controlLimit) {
            continue;
        }

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

    // round numeric values
    if (opModGenLimW !== undefined) {
        opModGenLimW = Math.round(opModGenLimW);
    }

    if (opModExpLimW !== undefined) {
        opModExpLimW = Math.round(opModExpLimW);
    }

    return {
        opModEnergize,
        opModConnect,
        opModGenLimW,
        opModExpLimW,
    };
}
