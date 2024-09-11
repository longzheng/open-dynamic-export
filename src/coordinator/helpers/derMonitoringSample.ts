import type {
    NoPhaseMeasurement,
    PerPhaseMeasurement,
} from '../../helpers/measurement.js';
import type { MonitoringSampleBase } from './monitoringSampleBase.js';

// aligns with the CSIP-AUS requirements for DER monitoring
export type DerMonitoringSampleData = {
    realPower: PerPhaseMeasurement | NoPhaseMeasurement;
    reactivePower: PerPhaseMeasurement | NoPhaseMeasurement;
    voltage: PerPhaseMeasurement | null;
    frequency: number | null;
};

export type DerMonitoringSample = MonitoringSampleBase &
    DerMonitoringSampleData;
