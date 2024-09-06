import type {
    PerPhaseMeasurement,
    PerPhaseOrNoPhaseMeasurement,
} from '../../helpers/measurement';
import type { MonitoringSampleBase } from './monitoringSampleBase';

// aligns with the CSIP-AUS requirements for site monitoring
export type SiteMonitoringSampleData = {
    realPower: PerPhaseOrNoPhaseMeasurement;
    reactivePower: PerPhaseOrNoPhaseMeasurement;
    voltage: PerPhaseMeasurement;
    frequency: number | null;
};

export type SiteMonitoringSample = MonitoringSampleBase &
    SiteMonitoringSampleData;
