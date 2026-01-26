import * as v from 'valibot';
import {
    noPhaseMeasurementSchema,
    perPhaseMeasurementSchema,
    perPhaseNetMeasurementSchema,
} from '../helpers/measurement.js';
import type { SampleBase } from '../coordinator/helpers/sampleBase.js';

// aligns with the CSIP-AUS requirements for site sample
export const siteSampleDataSchema = v.object({
    /**
     * Positive values = site import (consume) power
     *
     * Negative values = site export (produce) power
     */
    realPower: v.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    reactivePower: v.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    voltage: perPhaseMeasurementSchema,
    frequency: v.nullable(v.number()),
});

export type SiteSampleData = v.InferOutput<typeof siteSampleDataSchema>;

export type SiteSample = SampleBase & SiteSampleData;
