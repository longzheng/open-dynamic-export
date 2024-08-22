import type { SEP2Client } from '../../sep2/client';
import type {
    ChangedEventData,
    ControlType,
} from '../../sep2/helpers/controlScheduler';
import { ControlSchedulerHelper } from '../../sep2/helpers/controlScheduler';
import type { DerControlsHelperChangedData } from '../../sep2/helpers/derControls';
import {
    Conn,
    OutPFSet_Ena,
    VArPct_Ena,
    WMaxLim_Ena,
    type ControlsModel,
    type ControlsModelWrite,
} from '../../sunspec/models/controls';
import type { MonitoringSample } from './monitoring';
import type { DERControlBase } from '../../sep2/models/derControlBase';
import type { InverterSunSpecConnection } from '../../sunspec/connection/inverter';
import Decimal from 'decimal.js';
import { numberWithPow10 } from '../../helpers/number';
import { getTotalFromPerPhaseMeasurement } from '../../helpers/power';
import { getAveragePowerRatio } from '../../sunspec/helpers/controls';
import { type Logger } from 'pino';
import { logger as pinoLogger } from '../../helpers/logger';

type SupportedControlTypes = Extract<
    ControlType,
    'opModExpLimW' | 'opModGenLimW' | 'opModEnergize' | 'opModConnect'
>;

type InvertersData = {
    inverterControlsData: ControlsModel[];
    monitoringSample: MonitoringSample;
};

export type ActiveDERControlBaseValues = Pick<
    DERControlBase,
    SupportedControlTypes
>;

type InverterConfiguration =
    | { type: 'deenergize' }
    | {
          type: 'limit';
          targetSolarPowerRatio: number;
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
    private schedulerByControlType: {
        [T in SupportedControlTypes]: ControlSchedulerHelper<T>;
    };
    private cachedInvertersData: InvertersData | null = null;
    private applyControl: boolean;
    private logger: Logger;

    constructor({
        client,
        invertersConnections,
        applyControl,
    }: {
        client: SEP2Client;
        invertersConnections: InverterSunSpecConnection[];
        applyControl: boolean;
    }) {
        this.logger = pinoLogger.child({ module: 'InverterController' });

        this.applyControl = applyControl;
        this.inverterConnections = invertersConnections;

        this.schedulerByControlType = {
            opModExpLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModExpLimW',
            }).on('changed', (data) => {
                void this.onControlSchedulerChanged(data);
            }),
            opModEnergize: new ControlSchedulerHelper({
                client,
                controlType: 'opModEnergize',
            }).on('changed', (data) => {
                void this.onControlSchedulerChanged(data);
            }),
            opModConnect: new ControlSchedulerHelper({
                client,
                controlType: 'opModConnect',
            }).on('changed', (data) => {
                void this.onControlSchedulerChanged(data);
            }),
            opModGenLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModGenLimW',
            }).on('changed', (data) => {
                void this.onControlSchedulerChanged(data);
            }),
        };
    }

    updateSep2ControlsData(data: DerControlsHelperChangedData) {
        for (const scheduler of Object.values(this.schedulerByControlType)) {
            scheduler.updateControlsData(data);
        }
    }

    updateSunSpecInverterData(data: InvertersData) {
        this.logger.debug('Received inverter data, updating inverter controls');
        this.cachedInvertersData = data;

        void this.updateInverterControlValues();
    }

    private getActiveDerControlBaseValues(): ActiveDERControlBaseValues {
        return {
            opModExpLimW:
                this.schedulerByControlType.opModExpLimW.getActiveScheduleDerControlBaseValue(),
            opModGenLimW:
                this.schedulerByControlType.opModGenLimW.getActiveScheduleDerControlBaseValue(),
            opModEnergize:
                this.schedulerByControlType.opModEnergize.getActiveScheduleDerControlBaseValue(),
            opModConnect:
                this.schedulerByControlType.opModConnect.getActiveScheduleDerControlBaseValue(),
        };
    }

    private async updateInverterControlValues() {
        if (!this.cachedInvertersData) {
            this.logger.warn(
                'Inverter data is not avaialble, cannot update inverter controls',
            );
            return;
        }

        const activeDerControlBaseValues = this.getActiveDerControlBaseValues();

        const inverterConfiguration = calculateInverterConfiguration({
            activeDerControlBaseValues,
            inverterControlsData: this.cachedInvertersData.inverterControlsData,
            monitoringSample: this.cachedInvertersData.monitoringSample,
        });

        this.logger.debug(
            {
                activeDerControlBaseValues,
                inverterConfiguration,
            },
            'calculated inverterConfiguration',
        );

        await Promise.all(
            this.inverterConnections.map(async (inverter, index) => {
                // assume the inverter data is in the same order as the connections
                const inverterData =
                    this.cachedInvertersData?.inverterControlsData[index];

                if (!inverterData) {
                    throw new Error('Inverter data not found');
                }

                const writeControlsModel =
                    generateControlsModelWriteFromInverterConfiguration({
                        inverterConfiguration,
                        controlsModel: inverterData,
                    });

                if (this.applyControl) {
                    await inverter.writeControlsModel(writeControlsModel);
                }
            }),
        );
    }

    private async onControlSchedulerChanged(data: ChangedEventData) {
        this.logger.debug(
            'control schedule changed, updating inverter controls',
        );

        await this.updateInverterControlValues();

        switch (data.type) {
            case 'schedule': {
                data.onStart();
                break;
            }
            case 'fallback':
                break;
        }
    }
}

export function calculateInverterConfiguration({
    activeDerControlBaseValues,
    inverterControlsData,
    monitoringSample,
}: {
    activeDerControlBaseValues: ActiveDERControlBaseValues;
    inverterControlsData: ControlsModel[];
    monitoringSample: MonitoringSample;
}): InverterConfiguration {
    const logger = pinoLogger.child({ module: 'calculateDynamicExportConfig' });

    logger.trace(
        {
            activeDerControlBaseValues,
        },
        'activeDerControlBaseValue',
    );

    const energize =
        activeDerControlBaseValues.opModEnergize ?? defaultValues.opModEnergize;
    const connect =
        activeDerControlBaseValues.opModConnect ?? defaultValues.opModConnect;

    if (energize === false || connect === false) {
        logger.trace('return deenergize');
        return { type: 'deenergize' };
    }

    const siteWatts = getTotalFromPerPhaseMeasurement(
        monitoringSample.site.realPower,
    );
    const solarWatts = getTotalFromPerPhaseMeasurement(
        monitoringSample.der.realPower,
    );

    const exportLimitWatts = activeDerControlBaseValues.opModExpLimW
        ? numberWithPow10(
              activeDerControlBaseValues.opModExpLimW.value,
              activeDerControlBaseValues.opModExpLimW.multiplier,
          )
        : defaultValues.opModExpLimW;

    const generationLimitWatts = activeDerControlBaseValues.opModGenLimW
        ? numberWithPow10(
              activeDerControlBaseValues.opModGenLimW.value,
              activeDerControlBaseValues.opModGenLimW.multiplier,
          )
        : defaultValues.opModGenLimW;

    const exportLimitTargetSolarWatts = calculateTargetSolarWatts({
        exportLimitWatts,
        siteWatts,
        solarWatts,
    });

    // the limits need to be applied together
    // take the lesser of the export limit target solar watts or generation limit
    const targetSolarWatts = Math.min(generationLimitWatts, exportLimitWatts);

    const currentAveragePowerRatio = getAveragePowerRatio(inverterControlsData);

    const targetSolarPowerRatio = calculateTargetSolarPowerRatio({
        currentPowerRatio: currentAveragePowerRatio,
        currentSolarWatts: solarWatts,
        targetSolarWatts,
    });

    logger.trace(
        {
            siteWatts,
            solarWatts,
            exportLimitWatts,
            exportLimitTargetSolarWatts,
            generationLimitWatts,
            targetSolarWatts,
            currentAveragePowerRatio,
            targetSolarPowerRatio,
        },
        'return limit',
    );

    return {
        type: 'limit',
        targetSolarPowerRatio,
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
                    targetSolarPowerRatio:
                        inverterConfiguration.targetSolarPowerRatio,
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
