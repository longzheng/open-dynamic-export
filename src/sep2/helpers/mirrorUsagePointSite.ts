import { RoleFlagsType } from '../models/roleFlagsType';
import { getSamplesIntervalSeconds } from '../../coordinator/helpers/monitoring';
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
import type { SiteMonitoringSample } from '../../coordinator/helpers/siteMonitoring';

type SiteReading = {
    intervalSeconds: number;
    realPowerAverage: PerPhaseMeasurement;
    reactivePowerAverage: PerPhaseMeasurement;
    voltageAverage: PerPhaseMeasurement;
    frequency: {
        maximum: number;
        minimum: number;
    };
};

export class MirrorUsagePointSiteHelper extends MirrorUsagePointHelperBase<
    SiteMonitoringSample,
    SiteReading
> {
    protected roleFlags =
        RoleFlagsType.isPremisesAggregationPoint | RoleFlagsType.isMirror;
    protected description = 'Site measurement';
    protected logger = pinoLogger.child({
        module: 'MirrorUsagePointSiteHelper',
    });

    protected getReadingFromSamples(
        samples: SiteMonitoringSample[],
    ): SiteReading {
        return {
            intervalSeconds: getSamplesIntervalSeconds(samples),
            realPowerAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.realPower.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.realPower.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.realPower.phaseC),
                ),
            },
            reactivePowerAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.reactivePower.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.reactivePower.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.reactivePower.phaseC),
                ),
            },
            voltageAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.voltage.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.voltage.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.voltage.phaseC),
                ),
            },
            frequency: {
                maximum: Math.max(...samples.map((s) => s.frequency)),
                minimum: Math.min(...samples.map((s) => s.frequency)),
            },
        };
    }

    protected postRealPowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: SiteReading;
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
                        flowDirection: FlowDirectionType.Forward,
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
        reading: SiteReading;
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
                        flowDirection: FlowDirectionType.Forward,
                        intervalLength: reading.intervalSeconds,
                        phase,
                        powerOfTenMultiplier: phaseValue.pow10,
                        uom: UomType.var,
                    },
                },
            });
        };

        postReading(
            PhaseCode.PhaseA,
            'Average Reactive Power (VAR) - Phase A',
            reading.reactivePowerAverage.phaseA,
        );
        if (reading.reactivePowerAverage.phaseB) {
            postReading(
                PhaseCode.PhaseB,
                'Average Reactive Power (VAR) - Phase B',
                reading.reactivePowerAverage.phaseB,
            );
        }
        if (reading.reactivePowerAverage.phaseC) {
            postReading(
                PhaseCode.PhaseC,
                'Average Reactive Power (VAR) - Phase C',
                reading.reactivePowerAverage.phaseC,
            );
        }
    }

    protected postVoltageAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: SiteReading;
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
                        flowDirection: FlowDirectionType.Forward,
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
        reading: SiteReading;
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
                    flowDirection: FlowDirectionType.Forward,
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
                    flowDirection: FlowDirectionType.Forward,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: minimumValue.pow10,
                    uom: UomType.Hz,
                },
            },
        });
    }
}
