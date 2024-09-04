import type { PerPhaseMeasurement } from '../../helpers/power';
import type { MonitoringSampleBase } from './monitoringSampleBase';

export type SiteMonitoringSampleData = {
    realPower: PerPhaseMeasurement;
    reactivePower: PerPhaseMeasurement;
    voltage: PerPhaseMeasurement;
    frequency: number;
};

export type SiteMonitoringSample = MonitoringSampleBase &
    SiteMonitoringSampleData;
