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
    voltage: v.pipe(
        perPhaseMeasurementSchema,
        v.check(
            ({ phaseA, phaseB, phaseC }) =>
                (phaseA === null || phaseA >= 0) &&
                (phaseB === null || phaseB >= 0) &&
                (phaseC === null || phaseC >= 0),
            'Voltage must be non-negative per phase',
        ),
    ),
    frequency: v.nullable(v.pipe(v.number(), v.minValue(0))),
});

export type SiteSampleData = v.InferOutput<typeof siteSampleDataSchema>;

export type SiteSample = SampleBase & SiteSampleData;
