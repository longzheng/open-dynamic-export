import { RoleFlagsType } from '../models/roleFlagsType.js';
import {
    type NoPhaseMeasurement,
    type PerPhaseNetMeasurement,
    type AvgMaxMin,
    type PerPhaseMeasurement,
} from '../../helpers/measurement.js';
import {
    assertPerPhaseNetOrNoPhaseMeasurementArray,
    getAvgMaxMinOfNumbersNullable,
    getAvgMaxMinOfPerPhaseMeasurementsNullable,
    getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements,
} from '../../helpers/measurement.js';
import { DataQualifierType } from '../models/dataQualifierType.js';
import { FlowDirectionType } from '../models/flowDirectionType.js';
import { PhaseCode } from '../models/phaseCode.js';
import { UomType } from '../models/uomType.js';
import { type MirrorMeterReadingDefinitions } from './mirrorUsagePointBase.js';
import { MirrorUsagePointHelperBase } from './mirrorUsagePointBase.js';
import { pinoLogger } from '../../helpers/logger.js';
import { type DerSample } from '../../coordinator/helpers/derSample.js';
import { CommodityType } from '../models/commodityType.js';
import { KindType } from '../models/kindType.js';
import { type SEP2Client } from '../client.js';
import {
    objectEntriesWithType,
    objectFromEntriesWithType,
} from '../../helpers/object.js';

type DerReading = {
    realPower: AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement>;
    reactivePower: AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement>;
    voltage: AvgMaxMin<PerPhaseMeasurement> | null;
    frequency: AvgMaxMin<number> | null;
};

const mirrorMeterReadingDefinitions = {
    realPowerNetAverage: {
        description: 'DER Average Real Power (W) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseAAverage: {
        description: 'DER Average Real Power (W) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseBAverage: {
        description: 'DER Average Real Power (W) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseCAverage: {
        description: 'DER Average Real Power (W) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerNetMaximum: {
        description: 'DER Maximum Real Power (W) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseAMaximum: {
        description: 'DER Maximum Real Power (W) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseBMaximum: {
        description: 'DER Maximum Real Power (W) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseCMaximum: {
        description: 'DER Maximum Real Power (W) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerNetMinimum: {
        description: 'DER Minimum Real Power (W) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseAMinimum: {
        description: 'DER Minimum Real Power (W) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseBMinimum: {
        description: 'DER Minimum Real Power (W) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    realPowerPhaseCMinimum: {
        description: 'DER Minimum Real Power (W) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.W,
        },
    },
    reactivePowerNetAverage: {
        description: 'DER Average Reactive Power (VAR) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseAAverage: {
        description: 'DER Average Reactive Power (VAR) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseBAverage: {
        description: 'DER Average Reactive Power (VAR) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseCAverage: {
        description: 'DER Average Reactive Power (VAR) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerNetMaximum: {
        description: 'DER Maximum Reactive Power (VAR) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseAMaximum: {
        description: 'DER Maximum Reactive Power (VAR) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseBMaximum: {
        description: 'DER Maximum Reactive Power (VAR) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseCMaximum: {
        description: 'DER Maximum Reactive Power (VAR) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerNetMinimum: {
        description: 'DER Minimum Reactive Power (VAR) - Net',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseAMinimum: {
        description: 'DER Minimum Reactive Power (VAR) - Phase A',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseBMinimum: {
        description: 'DER Minimum Reactive Power (VAR) - Phase B',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    reactivePowerPhaseCMinimum: {
        description: 'DER Minimum Reactive Power (VAR) - Phase C',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.var,
        },
    },
    voltagePhaseAAverage: {
        description: 'DER Average Voltage (V) - Phase AN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseBAverage: {
        description: 'DER Average Voltage (V) - Phase BN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseCAverage: {
        description: 'DER Average Voltage (V) - Phase CN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseAMaximum: {
        description: 'DER Maximum Voltage (V) - Phase AN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseBMaximum: {
        description: 'DER Maximum Voltage (V) - Phase BN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseCMaximum: {
        description: 'DER Maximum Voltage (V) - Phase CN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseAMinimum: {
        description: 'DER Minimum Voltage (V) - Phase AN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseA,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseBMinimum: {
        description: 'DER Minimum Voltage (V) - Phase BN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseB,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    voltagePhaseCMinimum: {
        description: 'DER Minimum Voltage (V) - Phase CN',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.PhaseC,
            powerOfTenMultiplier: 0,
            uom: UomType.Voltage,
        },
    },
    frequencyAverage: {
        description: 'DER Average Frequency (Hz)',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Average,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.Hz,
        },
    },
    frequencyMaximum: {
        description: 'DER Maximum Frequency (Hz)',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Maximum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.Hz,
        },
    },
    frequencyMinimum: {
        description: 'DER Minimum Frequency (Hz)',
        ReadingType: {
            commodity: CommodityType.ElectricitySecondaryMeteredValue,
            kind: KindType.Power,
            dataQualifier: DataQualifierType.Minimum,
            flowDirection: FlowDirectionType.Reverse,
            phase: PhaseCode.NotApplicable,
            powerOfTenMultiplier: 0,
            uom: UomType.Hz,
        },
    },
} satisfies Record<string, MirrorMeterReadingDefinitions>;

type DerMirrorMeterReadingKeys = keyof typeof mirrorMeterReadingDefinitions;

export class MirrorUsagePointDerHelper extends MirrorUsagePointHelperBase<
    DerSample,
    DerReading,
    DerMirrorMeterReadingKeys
> {
    protected roleFlags =
        RoleFlagsType.isDER | RoleFlagsType.isMirror | RoleFlagsType.isSubmeter;
    protected description = 'DER measurement';
    protected logger = pinoLogger.child({
        module: 'MirrorUsagePointDerHelper',
    });
    protected mirrorMeterReadingMrids: Record<
        DerMirrorMeterReadingKeys,
        string
    >;

    constructor({ client }: { client: SEP2Client }) {
        super({ client });

        this.mirrorMeterReadingMrids = objectFromEntriesWithType(
            objectEntriesWithType(mirrorMeterReadingDefinitions).map(
                ([key, value]) => [
                    key,
                    this.client.generateMeterReadingMrid({
                        roleFlags: this.roleFlags,
                        description: value.description,
                    }),
                ],
            ),
        ) as Record<DerMirrorMeterReadingKeys, string>;
    }

    protected getReadingFromSamples(samples: DerSample[]): DerReading {
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
            voltage: getAvgMaxMinOfPerPhaseMeasurementsNullable(
                samples.map((s) => s.voltage),
            ),
            frequency: getAvgMaxMinOfNumbersNullable(
                samples.map((s) => s.frequency),
            ),
        };
    }

    protected override getReadingMrid(key: DerMirrorMeterReadingKeys): string {
        return this.mirrorMeterReadingMrids[key];
    }

    protected override getReadingDefinitions(): Record<
        DerMirrorMeterReadingKeys,
        MirrorMeterReadingDefinitions
    > {
        return mirrorMeterReadingDefinitions;
    }

    protected override getReadingValues({
        reading,
    }: {
        reading: DerReading;
    }): Record<DerMirrorMeterReadingKeys, number | null> {
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
            voltagePhaseAAverage: reading.voltage?.average.phaseA ?? null,
            voltagePhaseBAverage: reading.voltage?.average.phaseB ?? null,
            voltagePhaseCAverage: reading.voltage?.average.phaseC ?? null,
            voltagePhaseAMaximum: reading.voltage?.maximum.phaseA ?? null,
            voltagePhaseBMaximum: reading.voltage?.maximum.phaseB ?? null,
            voltagePhaseCMaximum: reading.voltage?.maximum.phaseC ?? null,
            voltagePhaseAMinimum: reading.voltage?.minimum.phaseA ?? null,
            voltagePhaseBMinimum: reading.voltage?.minimum.phaseB ?? null,
            voltagePhaseCMinimum: reading.voltage?.minimum.phaseC ?? null,
            frequencyAverage: reading.frequency?.average ?? null,
            frequencyMaximum: reading.frequency?.maximum ?? null,
            frequencyMinimum: reading.frequency?.minimum ?? null,
        };
    }
}
