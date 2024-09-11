import {
    noPhaseMeasurementSchema,
    perPhaseMeasurementSchema,
    perPhaseNetMeasurementSchema,
} from '../../helpers/measurement.js';
import type { MonitoringSampleBase } from './monitoringSampleBase.js';
import { z } from 'zod';

// aligns with the CSIP-AUS requirements for site monitoring
export const siteMonitoringSampleDataSchema = z.object({
    realPower: z.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    reactivePower: z.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    voltage: perPhaseMeasurementSchema,
    frequency: z.number().nullable(),
});

export type SiteMonitoringSampleData = z.infer<
    typeof siteMonitoringSampleDataSchema
>;

export type SiteMonitoringSample = MonitoringSampleBase &
    SiteMonitoringSampleData;
