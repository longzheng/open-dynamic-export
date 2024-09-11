import { RoleFlagsType } from '../models/roleFlagsType.js';
import { getSamplesIntervalSeconds } from '../../coordinator/helpers/monitoringSampleBase.js';
import type {
    NoPhaseMeasurement,
    PerPhaseNetMeasurement,
} from '../../helpers/measurement.js';
import {
    assertPerPhaseNetOrNoPhaseMeasurementArray,
    getAvgMaxMinOfNumbersNullable,
    getAvgMaxMinOfPerPhaseMeasurementsNullable,
    getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements,
    type AvgMaxMin,
    type PerPhaseMeasurement,
} from '../../helpers/measurement.js';
import { DataQualifierType } from '../models/dataQualifierType.js';
import { FlowDirectionType } from '../models/flowDirectionType.js';
import { PhaseCode } from '../models/phaseCode.js';
import { UomType } from '../models/uomType.js';
import { MirrorUsagePointHelperBase } from './mirrorUsagePointBase.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { DerMonitoringSample } from '../../coordinator/helpers/derMonitoringSample.js';

type DerReading = {
    intervalSeconds: number;
    realPower: AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement>;
    reactivePower: AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement>;
    voltage: AvgMaxMin<PerPhaseMeasurement> | null;
    frequency: AvgMaxMin<number> | null;
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

    protected postRealPower({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const postReading = ({
            phase,
            dataQualifier,
            description,
            value,
        }: {
            phase: PhaseCode;
            dataQualifier: DataQualifierType;
            description: string;
            value: number;
        }) =>
            this.sendMirrorMeterReading({
                phase,
                flowDirection: FlowDirectionType.Reverse,
                dataQualifier,
                description,
                value,
                uom: UomType.W,
                lastUpdateTime,
                nextUpdateTime,
                intervalLength: reading.intervalSeconds,
            });

        switch (reading.realPower.average.type) {
            case 'noPhase': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Average,
                    description: 'Average Real Power (W)',
                    value: reading.realPower.average.value,
                });
                break;
            }
            case 'perPhaseNet': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Average,
                    description: 'Average Real Power (W) - Net',
                    value: reading.realPower.average.net,
                });
                postReading({
                    phase: PhaseCode.PhaseA,
                    dataQualifier: DataQualifierType.Average,
                    description: 'Average Real Power (W) - Phase A',
                    value: reading.realPower.average.phaseA,
                });
                if (reading.realPower.average.phaseB) {
                    postReading({
                        phase: PhaseCode.PhaseB,
                        dataQualifier: DataQualifierType.Average,
                        description: 'Average Real Power (W) - Phase B',
                        value: reading.realPower.average.phaseB,
                    });
                }
                if (reading.realPower.average.phaseC) {
                    postReading({
                        phase: PhaseCode.PhaseC,
                        dataQualifier: DataQualifierType.Average,
                        description: 'Average Real Power (W) - Phase C',
                        value: reading.realPower.average.phaseC,
                    });
                }
                break;
            }
        }

        switch (reading.realPower.maximum.type) {
            case 'noPhase': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Maximum,
                    description: 'Maximum Real Power (W)',
                    value: reading.realPower.maximum.value,
                });
                break;
            }
            case 'perPhaseNet': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Maximum,
                    description: 'Maximum Real Power (W) - Net',
                    value: reading.realPower.maximum.net,
                });
                postReading({
                    phase: PhaseCode.PhaseA,
                    dataQualifier: DataQualifierType.Maximum,
                    description: 'Maximum Real Power (W) - Phase A',
                    value: reading.realPower.maximum.phaseA,
                });
                if (reading.realPower.maximum.phaseB) {
                    postReading({
                        phase: PhaseCode.PhaseB,
                        dataQualifier: DataQualifierType.Maximum,
                        description: 'Maximum Real Power (W) - Phase B',
                        value: reading.realPower.maximum.phaseB,
                    });
                }
                if (reading.realPower.maximum.phaseC) {
                    postReading({
                        phase: PhaseCode.PhaseC,
                        dataQualifier: DataQualifierType.Maximum,
                        description: 'Maximum Real Power (W) - Phase C',
                        value: reading.realPower.maximum.phaseC,
                    });
                }
                break;
            }
        }

        switch (reading.realPower.minimum.type) {
            case 'noPhase': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Minimum,
                    description: 'Minimum Real Power (W)',
                    value: reading.realPower.minimum.value,
                });
                break;
            }
            case 'perPhaseNet': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Minimum,
                    description: 'Minimum Real Power (W) - Net',
                    value: reading.realPower.minimum.net,
                });
                postReading({
                    phase: PhaseCode.PhaseA,
                    dataQualifier: DataQualifierType.Minimum,
                    description: 'Minimum Real Power (W) - Phase A',
                    value: reading.realPower.minimum.phaseA,
                });
                if (reading.realPower.minimum.phaseB) {
                    postReading({
                        phase: PhaseCode.PhaseB,
                        dataQualifier: DataQualifierType.Minimum,
                        description: 'Minimum Real Power (W) - Phase B',
                        value: reading.realPower.minimum.phaseB,
                    });
                }
                if (reading.realPower.minimum.phaseC) {
                    postReading({
                        phase: PhaseCode.PhaseC,
                        dataQualifier: DataQualifierType.Minimum,
                        description: 'Minimum Real Power (W) - Phase C',
                        value: reading.realPower.minimum.phaseC,
                    });
                }
                break;
            }
        }
    }

    protected postReactivePower({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const postReading = ({
            phase,
            dataQualifier,
            description,
            value,
        }: {
            phase: PhaseCode;
            dataQualifier: DataQualifierType;
            description: string;
            value: number;
        }) =>
            this.sendMirrorMeterReading({
                phase,
                flowDirection: FlowDirectionType.Reverse,
                dataQualifier,
                description,
                value,
                uom: UomType.var,
                lastUpdateTime,
                nextUpdateTime,
                intervalLength: reading.intervalSeconds,
            });

        switch (reading.reactivePower.average.type) {
            case 'noPhase': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Average,
                    description: 'Average Reactive Power (VAR)',
                    value: reading.reactivePower.average.value,
                });
                break;
            }
            case 'perPhaseNet': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Average,
                    description: 'Average Reactive Power (VAR) - Net',
                    value: reading.reactivePower.average.net,
                });
                postReading({
                    phase: PhaseCode.PhaseA,
                    dataQualifier: DataQualifierType.Average,
                    description: 'Average Reactive Power (VAR) - Phase A',
                    value: reading.reactivePower.average.phaseA,
                });
                if (reading.reactivePower.average.phaseB) {
                    postReading({
                        phase: PhaseCode.PhaseB,
                        dataQualifier: DataQualifierType.Average,
                        description: 'Average Reactive Power (VAR) - Phase B',
                        value: reading.reactivePower.average.phaseB,
                    });
                }
                if (reading.reactivePower.average.phaseC) {
                    postReading({
                        phase: PhaseCode.PhaseC,
                        dataQualifier: DataQualifierType.Average,
                        description: 'Average Reactive Power (VAR) - Phase C',
                        value: reading.reactivePower.average.phaseC,
                    });
                }
                break;
            }
        }

        switch (reading.reactivePower.maximum.type) {
            case 'noPhase': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Maximum,
                    description: 'Maximum Reactive Power (VAR)',
                    value: reading.reactivePower.maximum.value,
                });
                break;
            }
            case 'perPhaseNet': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Maximum,
                    description: 'Maximum Reactive Power (VAR) - Net',
                    value: reading.reactivePower.maximum.net,
                });
                postReading({
                    phase: PhaseCode.PhaseA,
                    dataQualifier: DataQualifierType.Maximum,
                    description: 'Maximum Reactive Power (VAR) - Phase A',
                    value: reading.reactivePower.maximum.phaseA,
                });
                if (reading.reactivePower.maximum.phaseB) {
                    postReading({
                        phase: PhaseCode.PhaseB,
                        dataQualifier: DataQualifierType.Maximum,
                        description: 'Maximum Reactive Power (VAR) - Phase B',
                        value: reading.reactivePower.maximum.phaseB,
                    });
                }
                if (reading.reactivePower.maximum.phaseC) {
                    postReading({
                        phase: PhaseCode.PhaseC,
                        dataQualifier: DataQualifierType.Maximum,
                        description: 'Maximum Reactive Power (VAR) - Phase C',
                        value: reading.reactivePower.maximum.phaseC,
                    });
                }
                break;
            }
        }

        switch (reading.reactivePower.minimum.type) {
            case 'noPhase': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Minimum,
                    description: 'Minimum Reactive Power (VAR)',
                    value: reading.reactivePower.minimum.value,
                });
                break;
            }
            case 'perPhaseNet': {
                postReading({
                    phase: PhaseCode.NotApplicable,
                    dataQualifier: DataQualifierType.Minimum,
                    description: 'Minimum Reactive Power (VAR) - Net',
                    value: reading.reactivePower.minimum.net,
                });
                postReading({
                    phase: PhaseCode.PhaseA,
                    dataQualifier: DataQualifierType.Minimum,
                    description: 'Minimum Reactive Power (VAR) - Phase A',
                    value: reading.reactivePower.minimum.phaseA,
                });
                if (reading.reactivePower.minimum.phaseB) {
                    postReading({
                        phase: PhaseCode.PhaseB,
                        dataQualifier: DataQualifierType.Minimum,
                        description: 'Minimum Reactive Power (VAR) - Phase B',
                        value: reading.reactivePower.minimum.phaseB,
                    });
                }
                if (reading.reactivePower.minimum.phaseC) {
                    postReading({
                        phase: PhaseCode.PhaseC,
                        dataQualifier: DataQualifierType.Minimum,
                        description: 'Minimum Reactive Power (VAR) - Phase C',
                        value: reading.reactivePower.minimum.phaseC,
                    });
                }
                break;
            }
        }
    }

    protected postVoltage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        if (reading.voltage === null) {
            return;
        }

        const postReading = ({
            phase,
            dataQualifier,
            description,
            value,
        }: {
            phase: PhaseCode;
            dataQualifier: DataQualifierType;
            description: string;
            value: number;
        }) =>
            this.sendMirrorMeterReading({
                phase,
                flowDirection: FlowDirectionType.Reverse,
                dataQualifier,
                description,
                value,
                uom: UomType.Voltage,
                lastUpdateTime,
                nextUpdateTime,
                intervalLength: reading.intervalSeconds,
            });

        // average
        postReading({
            phase: PhaseCode.PhaseAN,
            dataQualifier: DataQualifierType.Average,
            description: 'Average Voltage (V) - Phase AN',
            value: reading.voltage.average.phaseA,
        });
        if (reading.voltage.average.phaseB) {
            postReading({
                phase: PhaseCode.PhaseBN,
                dataQualifier: DataQualifierType.Average,
                description: 'Average Voltage (V) - Phase BN',
                value: reading.voltage.average.phaseB,
            });
        }
        if (reading.voltage.average.phaseC) {
            postReading({
                phase: PhaseCode.PhaseCN,
                dataQualifier: DataQualifierType.Average,
                description: 'Average Voltage (V) - Phase CN',
                value: reading.voltage.average.phaseC,
            });
        }

        // maximum
        postReading({
            phase: PhaseCode.PhaseAN,
            dataQualifier: DataQualifierType.Maximum,
            description: 'Maximum Voltage (V) - Phase AN',
            value: reading.voltage.maximum.phaseA,
        });
        if (reading.voltage.maximum.phaseB) {
            postReading({
                phase: PhaseCode.PhaseBN,
                dataQualifier: DataQualifierType.Maximum,
                description: 'Maximum Voltage (V) - Phase BN',
                value: reading.voltage.maximum.phaseB,
            });
        }
        if (reading.voltage.maximum.phaseC) {
            postReading({
                phase: PhaseCode.PhaseCN,
                dataQualifier: DataQualifierType.Maximum,
                description: 'Maximum Voltage (V) - Phase CN',
                value: reading.voltage.maximum.phaseC,
            });
        }

        // minimum
        postReading({
            phase: PhaseCode.PhaseAN,
            dataQualifier: DataQualifierType.Minimum,
            description: 'Minimum Voltage (V) - Phase AN',
            value: reading.voltage.minimum.phaseA,
        });
        if (reading.voltage.minimum.phaseB) {
            postReading({
                phase: PhaseCode.PhaseBN,
                dataQualifier: DataQualifierType.Minimum,
                description: 'Minimum Voltage (V) - Phase BN',
                value: reading.voltage.minimum.phaseB,
            });
        }
        if (reading.voltage.minimum.phaseC) {
            postReading({
                phase: PhaseCode.PhaseCN,
                dataQualifier: DataQualifierType.Minimum,
                description: 'Minimum Voltage (V) - Phase CN',
                value: reading.voltage.minimum.phaseC,
            });
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
        if (reading.frequency === null) {
            return;
        }

        void this.sendMirrorMeterReading({
            phase: PhaseCode.NotApplicable,
            flowDirection: FlowDirectionType.Reverse,
            dataQualifier: DataQualifierType.Average,
            description: 'Average Frequency (Hz)',
            value: reading.frequency.average,
            uom: UomType.Hz,
            intervalLength: reading.intervalSeconds,
            lastUpdateTime,
            nextUpdateTime,
        });

        void this.sendMirrorMeterReading({
            phase: PhaseCode.NotApplicable,
            flowDirection: FlowDirectionType.Reverse,
            dataQualifier: DataQualifierType.Maximum,
            description: 'Maximum Frequency (Hz)',
            value: reading.frequency.maximum,
            uom: UomType.Hz,
            intervalLength: reading.intervalSeconds,
            lastUpdateTime,
            nextUpdateTime,
        });

        void this.sendMirrorMeterReading({
            phase: PhaseCode.NotApplicable,
            flowDirection: FlowDirectionType.Reverse,
            dataQualifier: DataQualifierType.Minimum,
            description: 'Minimum Frequency (Hz)',
            value: reading.frequency.minimum,
            uom: UomType.Hz,
            intervalLength: reading.intervalSeconds,
            lastUpdateTime,
            nextUpdateTime,
        });
    }
}
