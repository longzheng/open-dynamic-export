import {
    noPhaseMeasurementSchema,
    perPhaseMeasurementSchema,
    perPhaseNetMeasurementSchema,
} from '../helpers/measurement.js';
import type { SampleBase } from '../coordinator/helpers/sampleBase.js';
import { z } from 'zod';

// aligns with the CSIP-AUS requirements for site sample
export const siteSampleDataSchema = z.object({
    /**
     * Positive values = site import power
     *
     * Negative values = site export power
     */
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

export type SiteSampleData = z.infer<typeof siteSampleDataSchema>;

export type SiteSample = SampleBase & SiteSampleData;
