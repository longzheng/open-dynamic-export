import type {
    NoPhaseMeasurement,
    PerPhaseMeasurement,
    PerPhaseNetMeasurement,
} from '../../helpers/measurement.js';
import type { SampleBase } from './sampleBase.js';

// aligns with the CSIP-AUS requirements for DER monitoring
export type DerSampleData = {
    realPower: PerPhaseNetMeasurement | NoPhaseMeasurement;
    reactivePower: PerPhaseNetMeasurement | NoPhaseMeasurement;
    voltage: PerPhaseMeasurement | null;
    frequency: number | null;
};

export type DerSample = SampleBase & DerSampleData;
