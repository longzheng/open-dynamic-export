import { RoleFlagsType } from '../models/roleFlagsType';
import {
    getSamplesIntervalSeconds,
    type MonitoringSample,
} from '../../coordinator/helpers/monitoring';
import type { PerPhaseMeasurement } from '../../helpers/power';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    convertNumberToBaseAndPow10Exponent,
} from '../../helpers/number';
import { QualityFlags } from '../models/qualityFlags';
import { CommodityType } from '../models/commodityType';
import { KindType } from '../models/kindType';
import { DataQualifierType } from '../models/dataQualifierType';
import { FlowDirectionType } from '../models/flowDirectionType';
import { PhaseCode } from '../models/phaseCode';
import { UomType } from '../models/uomType';
import { MirrorUsagePointHelperBase } from './mirrorUsagePointBase';
import { logger as pinoLogger } from '../../helpers/logger';

type DerMonitoringSample = Pick<MonitoringSample, 'date' | 'der'>;

type DerReading = {
    intervalSeconds: number;
    realPowerAverage: PerPhaseMeasurement;
    reactivePowerAverage: number;
    voltageAverage: PerPhaseMeasurement;
    frequency: {
        maximum: number;
        minimum: number;
    };
};

export class MirrorUsagePointDerHelper extends MirrorUsagePointHelperBase<
    DerMonitoringSample,
    DerReading
> {
    protected roleFlags =
        RoleFlagsType.isDER | RoleFlagsType.isMirror | RoleFlagsType.isSubmeter;
    protected description = 'DER measurement';
    protected logger = pinoLogger.child({
        module: 'MirrorUsagePointDerHelper',
    });

    protected getReadingFromSamples(
        samples: DerMonitoringSample[],
    ): DerReading {
        return {
            intervalSeconds: getSamplesIntervalSeconds(samples),
            realPowerAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.der.realPower.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.der.realPower.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.der.realPower.phaseC),
                ),
            },
            reactivePowerAverage: averageNumbersArray(
                samples.map((s) => s.der.reactivePower),
            ),
            voltageAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.der.voltage.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.der.voltage.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.der.voltage.phaseC),
                ),
            },
            frequency: {
                maximum: Math.max(...samples.map((s) => s.der.frequency)),
                minimum: Math.min(...samples.map((s) => s.der.frequency)),
            },
        };
    }

    protected postRealPowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const postReading = (
            phase: PhaseCode,
            description: string,
            value: number,
        ) => {
            const phaseValue = convertNumberToBaseAndPow10Exponent(value);

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description,
                    lastUpdateTime,
                    nextUpdateTime,
                    Reading: {
                        value: phaseValue.base,
                        qualityFlags: QualityFlags.Valid,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        intervalLength: reading.intervalSeconds,
                        phase,
                        powerOfTenMultiplier: phaseValue.pow10,
                        uom: UomType.W,
                    },
                },
            });
        };

        postReading(
            PhaseCode.PhaseA,
            'Average Real Power (W) - Phase A',
            reading.realPowerAverage.phaseA,
        );
        if (reading.realPowerAverage.phaseB) {
            postReading(
                PhaseCode.PhaseB,
                'Average Real Power (W) - Phase B',
                reading.realPowerAverage.phaseB,
            );
        }
        if (reading.realPowerAverage.phaseC) {
            postReading(
                PhaseCode.PhaseC,
                'Average Real Power (W) - Phase C',
                reading.realPowerAverage.phaseC,
            );
        }
    }

    protected postReactivePowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const value = convertNumberToBaseAndPow10Exponent(
            reading.reactivePowerAverage,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Average Reactive Power (VAR)',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: value.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Average,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: value.pow10,
                    uom: UomType.var,
                },
            },
        });
    }

    protected postVoltageAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const postReading = (
            phase: PhaseCode,
            description: string,
            value: number,
        ) => {
            const phaseValue = convertNumberToBaseAndPow10Exponent(value);

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description,
                    lastUpdateTime,
                    nextUpdateTime,
                    Reading: {
                        value: phaseValue.base,
                        qualityFlags: QualityFlags.Valid,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        intervalLength: reading.intervalSeconds,
                        phase,
                        powerOfTenMultiplier: phaseValue.pow10,
                        uom: UomType.Voltage,
                    },
                },
            });
        };

        postReading(
            PhaseCode.PhaseA,
            'Average Voltage (V) - Phase A',
            reading.voltageAverage.phaseA,
        );
        if (reading.voltageAverage.phaseB) {
            postReading(
                PhaseCode.PhaseB,
                'Average Voltage (V) - Phase B',
                reading.voltageAverage.phaseB,
            );
        }
        if (reading.voltageAverage.phaseC) {
            postReading(
                PhaseCode.PhaseC,
                'Average Voltage (V) - Phase C',
                reading.voltageAverage.phaseC,
            );
        }
    }

    protected postFrequency({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const maximumValue = convertNumberToBaseAndPow10Exponent(
            reading.frequency.maximum,
        );
        const minimumValue = convertNumberToBaseAndPow10Exponent(
            reading.frequency.minimum,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Maximum Frequency (Hz)',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: maximumValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Maximum,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: maximumValue.pow10,
                    uom: UomType.Hz,
                },
            },
        });

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Minimum Frequency (Hz)',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: minimumValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Minimum,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: minimumValue.pow10,
                    uom: UomType.Hz,
                },
            },
        });
    }
}
