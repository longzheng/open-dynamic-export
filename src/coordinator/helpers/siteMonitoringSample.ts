import type { PerPhaseMeasurement } from '../../helpers/power';
import type { MonitoringSampleBase } from './monitoringSampleBase';

export type SiteMonitoringSample = MonitoringSampleBase & {
    realPower: PerPhaseMeasurement;
    reactivePower: PerPhaseMeasurement;
    voltage: PerPhaseMeasurement;
    frequency: number;
};
