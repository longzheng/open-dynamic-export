import {
    perPhaseMeasurementSchema,
    perPhaseOrNoPhaseMeasurementSchema,
} from '../../helpers/measurement';
import type { MonitoringSampleBase } from './monitoringSampleBase';
import { z } from 'zod';

// aligns with the CSIP-AUS requirements for site monitoring
export const siteMonitoringSampleDataSchema = z.object({
    realPower: perPhaseOrNoPhaseMeasurementSchema,
    reactivePower: perPhaseOrNoPhaseMeasurementSchema,
    voltage: perPhaseMeasurementSchema,
    frequency: z.number().nullable(),
});

export type SiteMonitoringSampleData = z.infer<
    typeof siteMonitoringSampleDataSchema
>;

export type SiteMonitoringSample = MonitoringSampleBase &
    SiteMonitoringSampleData;
