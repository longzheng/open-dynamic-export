import { Decimal } from 'decimal.js';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    mathMaxNullableArray,
    mathMinNullableArray,
} from './number.js';
import { z } from 'zod';

export const perPhaseMeasurementSchema = z.object({
    type: z.literal('perPhase'),
    phaseA: z.number(),
    phaseB: z.number().nullable(),
    phaseC: z.number().nullable(),
});

export type PerPhaseMeasurement = z.infer<typeof perPhaseMeasurementSchema>;

export const noPhaseMeasurementSchema = z.object({
    type: z.literal('noPhase'),
    value: z.number(),
});

export type NoPhaseMeasurement = z.infer<typeof noPhaseMeasurementSchema>;

export const perPhaseOrNoPhaseMeasurementSchema = z.union([
    perPhaseMeasurementSchema,
    noPhaseMeasurementSchema,
]);

export type PerPhaseOrNoPhaseMeasurement = z.infer<
    typeof perPhaseOrNoPhaseMeasurementSchema
>;

export type AssertedPerPhaseOrNoPhaseMeasurementArray =
    | {
          type: 'perPhase';
          measurements: PerPhaseMeasurement[];
      }
    | {
          type: 'noPhase';
          measurements: NoPhaseMeasurement[];
      };

// an array of PerPhaseOrNoPhaseMeasurement may contain both types mixed together
// to simplify calculations, we assert that the array contains only one type
export function assertPerPhaseOrNoPhaseMeasurementArray(
    measurements: PerPhaseOrNoPhaseMeasurement[],
): AssertedPerPhaseOrNoPhaseMeasurementArray {
    // prefer per phase measurements
    const perPhaseMeasurements = measurements.filter(
        (measurement) => measurement.type === 'perPhase',
    );

    if (perPhaseMeasurements.length > 0) {
        return {
            type: 'perPhase',
            measurements: perPhaseMeasurements,
        };
    }

    const noPhaseMeasurements = measurements.filter(
        (measurement) => measurement.type === 'noPhase',
    );

    return {
        type: 'noPhase',
        measurements: noPhaseMeasurements,
    };
}

export function getTotalFromPerPhaseOrNoPhaseMeasurement(
    measurement: PerPhaseOrNoPhaseMeasurement,
) {
    switch (measurement.type) {
        case 'noPhase':
            return measurement.value;
        case 'perPhase':
            return new Decimal(measurement.phaseA)
                .plus(measurement.phaseB ?? 0)
                .plus(measurement.phaseC ?? 0)
                .toNumber();
    }
}

type PhaseValues = {
    phaseA: number[];
    phaseB: (number | null)[];
    phaseC: (number | null)[];
};

function getPhaseValuesFromPerPhaseMeasurements(
    measurements: PerPhaseMeasurement[],
): PhaseValues {
    return {
        phaseA: measurements.map((m) => m.phaseA),
        phaseB: measurements.map((m) => m.phaseB),
        phaseC: measurements.map((m) => m.phaseC),
    };
}

function getAverageFromPerPhaseMeasurements(
    phaseValues: PhaseValues,
): PerPhaseMeasurement {
    return {
        type: 'perPhase',
        phaseA: averageNumbersArray(phaseValues.phaseA),
        phaseB: averageNumbersNullableArray(phaseValues.phaseB),
        phaseC: averageNumbersNullableArray(phaseValues.phaseC),
    };
}

function getMinimumFromPerPhaseMeasurements(
    phaseValues: PhaseValues,
): PerPhaseMeasurement {
    return {
        type: 'perPhase',
        phaseA: Math.min(...phaseValues.phaseA),
        phaseB: mathMinNullableArray(phaseValues.phaseB),
        phaseC: mathMinNullableArray(phaseValues.phaseC),
    };
}

function getMaximumFromPerPhaseMeasurements(
    phaseValues: PhaseValues,
): PerPhaseMeasurement {
    return {
        type: 'perPhase',
        phaseA: Math.max(...phaseValues.phaseA),
        phaseB: mathMaxNullableArray(phaseValues.phaseB),
        phaseC: mathMaxNullableArray(phaseValues.phaseC),
    };
}

export type AvgMaxMin<T> = {
    average: T;
    maximum: T;
    minimum: T;
};

export function getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements(
    array: AssertedPerPhaseOrNoPhaseMeasurementArray,
): AvgMaxMin<PerPhaseOrNoPhaseMeasurement> {
    switch (array.type) {
        case 'noPhase': {
            const values = array.measurements.map((m) => m.value);

            return {
                average: {
                    type: 'noPhase',
                    value: averageNumbersArray(values),
                },
                maximum: {
                    type: 'noPhase',
                    value: Math.max(...values),
                },
                minimum: {
                    type: 'noPhase',
                    value: Math.min(...values),
                },
            };
        }
        case 'perPhase': {
            const phaseValues = getPhaseValuesFromPerPhaseMeasurements(
                array.measurements,
            );

            return {
                average: getAverageFromPerPhaseMeasurements(phaseValues),
                maximum: getMaximumFromPerPhaseMeasurements(phaseValues),
                minimum: getMinimumFromPerPhaseMeasurements(phaseValues),
            };
        }
    }
}

export function getAvgMaxMinOfPerPhaseMeasurements(
    array: PerPhaseMeasurement[],
): AvgMaxMin<PerPhaseMeasurement> {
    const phaseValues = getPhaseValuesFromPerPhaseMeasurements(array);

    return {
        average: getAverageFromPerPhaseMeasurements(phaseValues),
        maximum: getMaximumFromPerPhaseMeasurements(phaseValues),
        minimum: getMinimumFromPerPhaseMeasurements(phaseValues),
    };
}

export function getAvgMaxMinOfPerPhaseMeasurementsNullable(
    array: (PerPhaseMeasurement | null)[],
): AvgMaxMin<PerPhaseMeasurement> | null {
    if (array.some((number) => number === null)) {
        return null;
    }

    const phaseValues = getPhaseValuesFromPerPhaseMeasurements(
        array as PerPhaseMeasurement[],
    );

    return {
        average: getAverageFromPerPhaseMeasurements(phaseValues),
        maximum: getMaximumFromPerPhaseMeasurements(phaseValues),
        minimum: getMinimumFromPerPhaseMeasurements(phaseValues),
    };
}

export function getAvgMaxMinOfNumbersNullable(
    array: (number | null)[],
): AvgMaxMin<number> | null {
    if (array.some((number) => number === null)) {
        return null;
    }

    return {
        average: averageNumbersArray(array as number[]),
        maximum: Math.max(...(array as number[])),
        minimum: Math.min(...(array as number[])),
    };
}
