import { RoleFlagsType } from '../models/roleFlagsType.js';
import type {
    AvgMaxMin,
    NoPhaseMeasurement,
    PerPhaseNetMeasurement,
} from '../../helpers/measurement.js';
import {
    assertPerPhaseNetOrNoPhaseMeasurementArray,
    getAvgMaxMinOfNumbersNullable,
    getAvgMaxMinOfPerPhaseMeasurements,
    getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements,
    type PerPhaseMeasurement,
} from '../../helpers/measurement.js';
import { DataQualifierType } from '../models/dataQualifierType.js';
import { FlowDirectionType } from '../models/flowDirectionType.js';
import { PhaseCode } from '../models/phaseCode.js';
import { UomType } from '../models/uomType.js';
import type { MirrorMeterReadingDefinitions } from './mirrorUsagePointBase.js';
import { MirrorUsagePointHelperBase } from './mirrorUsagePointBase.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { SiteSample } from '../../meters/siteSample.js';
import { CommodityType } from '../models/commodityType.js';
import { KindType } from '../models/kindType.js';
import type { SEP2Client } from '../client.js';
import { objectEntriesWithType } from '../../helpers/object.js';

type SiteReading = {
    realPower: AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement>;
    reactivePower: AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement>;
    voltage: AvgMaxMin<PerPhaseMeasurement>;
    frequency: AvgMaxMin<number> | null;
};

const mirrorMeterReadingDefinitions = {
    realPowerNetAverage: {
        description: 'Average Real Power (W) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseAAverage: {
        description: 'Average Real Power (W) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseBAverage: {
        description: 'Average Real Power (W) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseCAverage: {
        description: 'Average Real Power (W) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerNetMaximum: {
        description: 'Maximum Real Power (W) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseAMaximum: {
        description: 'Maximum Real Power (W) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseBMaximum: {
        description: 'Maximum Real Power (W) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseCMaximum: {
        description: 'Maximum Real Power (W) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerNetMinimum: {
        description: 'Minimum Real Power (W) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseAMinimum: {
        description: 'Minimum Real Power (W) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseBMinimum: {
        description: 'Minimum Real Power (W) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseCMinimum: {
        description: 'Minimum Real Power (W) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    reactivePowerNetAverage: {
        description: 'Average Reactive Power (VAR) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseAAverage: {
        description: 'Average Reactive Power (VAR) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseBAverage: {
        description: 'Average Reactive Power (VAR) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseCAverage: {
        description: 'Average Reactive Power (VAR) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerNetMaximum: {
        description: 'Maximum Reactive Power (VAR) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseAMaximum: {
        description: 'Maximum Reactive Power (VAR) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseBMaximum: {
        description: 'Maximum Reactive Power (VAR) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseCMaximum: {
        description: 'Maximum Reactive Power (VAR) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerNetMinimum: {
        description: 'Minimum Reactive Power (VAR) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseAMinimum: {
        description: 'Minimum Reactive Power (VAR) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseBMinimum: {
        description: 'Minimum Reactive Power (VAR) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseCMinimum: {
        description: 'Minimum Reactive Power (VAR) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    voltagePhaseAAverage: {
        description: 'Average Voltage (V) - Phase AN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseAN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseBAverage: {
        description: 'Average Voltage (V) - Phase BN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseBN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseCAverage: {
        description: 'Average Voltage (V) - Phase CN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseCN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseAMaximum: {
        description: 'Maximum Voltage (V) - Phase AN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseAN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseBMaximum: {
        description: 'Maximum Voltage (V) - Phase BN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseBN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseCMaximum: {
        description: 'Maximum Voltage (V) - Phase CN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseCN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseAMinimum: {
        description: 'Minimum Voltage (V) - Phase AN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseAN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseBMinimum: {
        description: 'Minimum Voltage (V) - Phase BN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseBN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseCMinimum: {
        description: 'Minimum Voltage (V) - Phase CN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.PhaseCN,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    frequencyAverage: {
        description: 'Average Frequency (Hz)',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.Hz,
        },
    },
    frequencyMaximum: {
        description: 'Maximum Frequency (Hz)',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.Hz,
        },
    },
    frequencyMinimum: {
        description: 'Minimum Frequency (Hz)',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Forward,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.Hz,
        },
    },
} satisfies Record<string, MirrorMeterReadingDefinitions>;

type SiteMirrorMeterReadingKeys = keyof typeof mirrorMeterReadingDefinitions;

export class MirrorUsagePointSiteHelper extends MirrorUsagePointHelperBase<
    SiteSample,
    SiteReading,
    SiteMirrorMeterReadingKeys
> {
    protected roleFlags =
        RoleFlagsType.isPremisesAggregationPoint | RoleFlagsType.isMirror;
    protected description = 'Site measurement';
    protected logger = pinoLogger.child({
        module: 'MirrorUsagePointSiteHelper',
    });
    protected mirrorMeterReadingMrids: Record<
        SiteMirrorMeterReadingKeys,
        string
    >;

    constructor({ client }: { client: SEP2Client }) {
        super({ client });

        this.mirrorMeterReadingMrids = Object.fromEntries(
            objectEntriesWithType(mirrorMeterReadingDefinitions).map(
                ([key, value]) => [
                    key,
                    this.client.generateMeterReadingMrid({
                        roleFlags: this.roleFlags,
                        description: value.description,
                    }),
                ],
            ),
        ) as Record<SiteMirrorMeterReadingKeys, string>;
    }

    protected getReadingFromSamples(samples: SiteSample[]): SiteReading {
        return {
            realPower: getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements(
                assertPerPhaseNetOrNoPhaseMeasurementArray(
                    samples.map((s) => s.realPower),
                ),
            ),
            reactivePower: getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements(
                assertPerPhaseNetOrNoPhaseMeasurementArray(
                    samples.map((s) => s.reactivePower),
                ),
            ),
            voltage: getAvgMaxMinOfPerPhaseMeasurements(
                samples.map((s) => s.voltage),
            ),
            frequency: getAvgMaxMinOfNumbersNullable(
                samples.map((s) => s.frequency),
            ),
        };
    }

    protected override getReadingMrid(key: SiteMirrorMeterReadingKeys): string {
        return this.mirrorMeterReadingMrids[key];
    }

    protected override getReadingDefintions(): Record<
        SiteMirrorMeterReadingKeys,
        MirrorMeterReadingDefinitions
    > {
        return mirrorMeterReadingDefinitions;
    }

    protected override getReadingValues({
        reading,
    }: {
        reading: SiteReading;
    }): Record<SiteMirrorMeterReadingKeys, number | null> {
        return {
            realPowerNetAverage: reading.realPower.average.net,
            realPowerPhaseAAverage:
                reading.realPower.average.type === 'perPhaseNet'
                    ? reading.realPower.average.phaseA
                    : null,
            realPowerPhaseBAverage:
                reading.realPower.average.type === 'perPhaseNet'
                    ? reading.realPower.average.phaseB
                    : null,
            realPowerPhaseCAverage:
                reading.realPower.average.type === 'perPhaseNet'
                    ? reading.realPower.average.phaseC
                    : null,
            realPowerNetMaximum: reading.realPower.maximum.net,
            realPowerPhaseAMaximum:
                reading.realPower.maximum.type === 'perPhaseNet'
                    ? reading.realPower.maximum.phaseA
                    : null,
            realPowerPhaseBMaximum:
                reading.realPower.maximum.type === 'perPhaseNet'
                    ? reading.realPower.maximum.phaseB
                    : null,
            realPowerPhaseCMaximum:
                reading.realPower.maximum.type === 'perPhaseNet'
                    ? reading.realPower.maximum.phaseC
                    : null,
            realPowerNetMinimum: reading.realPower.minimum.net,
            realPowerPhaseAMinimum:
                reading.realPower.minimum.type === 'perPhaseNet'
                    ? reading.realPower.minimum.phaseA
                    : null,
            realPowerPhaseBMinimum:
                reading.realPower.minimum.type === 'perPhaseNet'
                    ? reading.realPower.minimum.phaseB
                    : null,
            realPowerPhaseCMinimum:
                reading.realPower.minimum.type === 'perPhaseNet'
                    ? reading.realPower.minimum.phaseC
                    : null,
            reactivePowerNetAverage: reading.reactivePower.average.net,
            reactivePowerPhaseAAverage:
                reading.reactivePower.average.type === 'perPhaseNet'
                    ? reading.reactivePower.average.phaseA
                    : null,
            reactivePowerPhaseBAverage:
                reading.reactivePower.average.type === 'perPhaseNet'
                    ? reading.reactivePower.average.phaseB
                    : null,
            reactivePowerPhaseCAverage:
                reading.reactivePower.average.type === 'perPhaseNet'
                    ? reading.reactivePower.average.phaseC
                    : null,
            reactivePowerNetMaximum: reading.reactivePower.maximum.net,
            reactivePowerPhaseAMaximum:
                reading.reactivePower.maximum.type === 'perPhaseNet'
                    ? reading.reactivePower.maximum.phaseA
                    : null,
            reactivePowerPhaseBMaximum:
                reading.reactivePower.maximum.type === 'perPhaseNet'
                    ? reading.reactivePower.maximum.phaseB
                    : null,
            reactivePowerPhaseCMaximum:
                reading.reactivePower.maximum.type === 'perPhaseNet'
                    ? reading.reactivePower.maximum.phaseC
                    : null,
            reactivePowerNetMinimum: reading.reactivePower.minimum.net,
            reactivePowerPhaseAMinimum:
                reading.reactivePower.minimum.type === 'perPhaseNet'
                    ? reading.reactivePower.minimum.phaseA
                    : null,
            reactivePowerPhaseBMinimum:
                reading.reactivePower.minimum.type === 'perPhaseNet'
                    ? reading.reactivePower.minimum.phaseB
                    : null,
            reactivePowerPhaseCMinimum:
                reading.reactivePower.minimum.type === 'perPhaseNet'
                    ? reading.reactivePower.minimum.phaseC
                    : null,
            voltagePhaseAAverage: reading.voltage.average.phaseA,
            voltagePhaseBAverage: reading.voltage.average.phaseB,
            voltagePhaseCAverage: reading.voltage.average.phaseC,
            voltagePhaseAMaximum: reading.voltage.maximum.phaseA,
            voltagePhaseBMaximum: reading.voltage.maximum.phaseB,
            voltagePhaseCMaximum: reading.voltage.maximum.phaseC,
            voltagePhaseAMinimum: reading.voltage.minimum.phaseA,
            voltagePhaseBMinimum: reading.voltage.minimum.phaseB,
            voltagePhaseCMinimum: reading.voltage.minimum.phaseC,
            frequencyAverage: reading.frequency?.average ?? null,
            frequencyMaximum: reading.frequency?.maximum ?? null,
            frequencyMinimum: reading.frequency?.minimum ?? null,
        };
    }
}
