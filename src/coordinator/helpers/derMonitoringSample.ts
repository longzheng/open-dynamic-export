import type {
    PerPhaseMeasurement,
    PerPhaseOrNoPhaseMeasurement,
} from '../../helpers/measurement';
import type { MonitoringSampleBase } from './monitoringSampleBase';

// aligns with the CSIP-AUS requirements for DER monitoring
export type DerMonitoringSampleData = {
    realPower: PerPhaseOrNoPhaseMeasurement;
    reactivePower: PerPhaseOrNoPhaseMeasurement;
    voltage: PerPhaseMeasurement | null;
    frequency: number | null;
};

export type DerMonitoringSample = MonitoringSampleBase &
    DerMonitoringSampleData;
