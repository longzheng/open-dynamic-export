import type { PerPhaseMeasurement } from '../../helpers/power';
import type { MonitoringSampleBase } from './monitoringSampleBase';

export type DerMonitoringSample = MonitoringSampleBase & {
    realPower: PerPhaseMeasurement;
    reactivePower: number;
    voltage: PerPhaseMeasurement;
    frequency: number;
};
