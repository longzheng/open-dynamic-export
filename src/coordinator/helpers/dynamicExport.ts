import Decimal from 'decimal.js';
import { getTotalFromPerPhaseMeasurement } from '../../helpers/power';
import type { MonitoringSample } from './monitoring';
import type { ControlsModel } from '../../sunspec/models/controls';
import {
    OutPFSet_Ena,
    VArPct_Ena,
    WMaxLim_Ena,
} from '../../sunspec/models/controls';
import { Conn, type ControlsModelWrite } from '../../sunspec/models/controls';
import type { DERControlBase } from '../../sep2/models/derControlBase';
import { numberWithPow10 } from '../../helpers/number';
import { logger as pinoLogger } from '../../helpers/logger';
import { getAveragePowerRatio } from '../../sunspec/helpers/controls';

const logger = pinoLogger.child({ module: 'dynamic-export' });

const defaultValues = {
    opModExpLimW: 0,
    opModImpLimW: 0,
    opModEnergize: true,
    opModConnect: true,
};

export function generateControlsModelWriteFromDynamicExportConfig({
    config,
    controlsModel,
}: {
    config: DynamicExportConfig;
    controlsModel: ControlsModel;
}): ControlsModelWrite {
    switch (config.type) {
        case 'deenergize':
            return {
                ...controlsModel,
                Conn: Conn.DISCONNECT,
                // some devices may not support setting Conn so we also try setting power to 0
                WMaxLim_Ena: WMaxLim_Ena.ENABLED,
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
                    targetSolarPowerRatio: config.targetSolarPowerRatio,
                    controlsModel,
                }),
                // revert WMaxLimtPct in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another dynamic export config witin 60 seconds to reset this timeout
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
    return numberWithPow10(
        new Decimal(targetSolarPowerRatio).times(100).toNumber(),
        -controlsModel.WMaxLimPct_SF,
    );
}

type DynamicExportConfig =
    | { type: 'deenergize' }
    | {
          type: 'limit';
          targetSolarPowerRatio: number;
      };

export function calculateDynamicExportConfig({
    activeDerControlBase,
    inverterControlsData,
    monitoringSample,
}: {
    activeDerControlBase: DERControlBase | null;
    inverterControlsData: ControlsModel[];
    monitoringSample: MonitoringSample;
}): DynamicExportConfig {
    if (activeDerControlBase?.opModEnergize === false) {
        return { type: 'deenergize' };
    }

    const siteWatts = getTotalFromPerPhaseMeasurement(
        monitoringSample.site.realPower,
    );
    const solarWatts = getTotalFromPerPhaseMeasurement(
        monitoringSample.der.realPower,
    );

    const exportLimitWatts = activeDerControlBase?.opModExpLimW
        ? numberWithPow10(
              activeDerControlBase.opModExpLimW.value,
              activeDerControlBase.opModExpLimW.multiplier,
          )
        : // fallback to universal default of 1500W
          defaultValues.opModExpLimW;

    const targetSolarWatts = calculateTargetSolarWatts({
        exportLimitWatts,
        siteWatts,
        solarWatts,
    });

    const currentAveragePowerRatio = getAveragePowerRatio(inverterControlsData);

    const targetSolarPowerRatio = calculateTargetSolarPowerRatio({
        currentPowerRatio: currentAveragePowerRatio,
        currentSolarWatts: solarWatts,
        targetSolarWatts,
    });

    logger.child({ module: 'calculateDynamicExportConfig' }).debug(
        {
            siteWatts,
            solarWatts,
            targetSolarWatts,
            currentPowerRatio: currentAveragePowerRatio,
            targetSolarPowerRatio,
        },
        'calculated limit',
    );

    return {
        type: 'limit',
        targetSolarPowerRatio,
    };
}

export function calculateTargetSolarPowerRatio({
    currentSolarWatts,
    targetSolarWatts,
    currentPowerRatio,
}: {
    currentSolarWatts: number;
    targetSolarWatts: number;
    // the current power ratio expressed as a decimal (0.0-1.0)
    currentPowerRatio: number;
}) {
    // edge case if the current power ratio is 0
    // there is no way to calculate the target power ratio because we cannot divide by 0
    // set a hard-coded power ratio
    // hopefully at a future cycle then it will be able to calculate the target power ratio
    if (currentPowerRatio === 0 || isNaN(currentPowerRatio)) {
        if (targetSolarWatts > currentSolarWatts) {
            // if the target is higher than the current, set a hard-coded power ratio of 0.01
            return 0.01;
        } else {
            // if the target is lower than the current, set a hard-coded power ratio of 0
            return 0;
        }
    }

    const estimatedSolarCapacity = new Decimal(currentSolarWatts).div(
        currentPowerRatio,
    );
    const targetPowerRatio = new Decimal(targetSolarWatts).div(
        estimatedSolarCapacity,
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
