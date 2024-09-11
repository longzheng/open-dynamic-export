import {
    averageNumbersArray,
    averageNumbersNullableArray,
    mathMaxNullableArray,
    mathMinNullableArray,
} from './number.js';
import { z } from 'zod';

// per-phase measurements where the phases cannot be net metered (e.g. voltage)
export const perPhaseMeasurementSchema = z.object({
    type: z.literal('perPhase'),
    phaseA: z.number(),
    phaseB: z.number().nullable(),
    phaseC: z.number().nullable(),
});

export type PerPhaseMeasurement = z.infer<typeof perPhaseMeasurementSchema>;

// per-phase measurements where the phases can be net metered (e.g. power)
export const perPhaseNetMeasurementSchema = z.object({
    type: z.literal('perPhaseNet'),
    phaseA: z.number(),
    phaseB: z.number().nullable(),
    phaseC: z.number().nullable(),
    net: z.number(),
});

export type PerPhaseNetMeasurement = z.infer<
    typeof perPhaseNetMeasurementSchema
>;

export const noPhaseMeasurementSchema = z.object({
    type: z.literal('noPhase'),
    value: z.number(),
});

export type NoPhaseMeasurement = z.infer<typeof noPhaseMeasurementSchema>;

export type AssertedPerPhaseNetOrNoPhaseMeasurementArray =
    | {
          type: 'perPhaseNet';
          measurements: PerPhaseNetMeasurement[];
      }
    | {
          type: 'noPhase';
          measurements: NoPhaseMeasurement[];
      };

// an array of measurements may contain both types mixed together
// to simplify calculations, we assert that the array contains only one type
export function assertPerPhaseNetOrNoPhaseMeasurementArray(
    measurements: (PerPhaseNetMeasurement | NoPhaseMeasurement)[],
): AssertedPerPhaseNetOrNoPhaseMeasurementArray {
    if (measurements.length === 0) {
        return {
            type: 'noPhase',
            measurements: [],
        };
    }

    // use the first measurement type to filter the rest of the array
    switch (measurements.at(0)!.type) {
        case 'perPhaseNet': {
            return {
                type: 'perPhaseNet',
                measurements: measurements.filter(
                    (m) => m.type === 'perPhaseNet',
                ),
            };
        }
        case 'noPhase': {
            return {
                type: 'noPhase',
                measurements: measurements.filter((m) => m.type === 'noPhase'),
            };
        }
    }
}

export function getTotalFromPerPhaseNetOrNoPhaseMeasurement(
    measurement: PerPhaseNetMeasurement | NoPhaseMeasurement,
) {
    switch (measurement.type) {
        case 'noPhase':
            return measurement.value;
        case 'perPhaseNet':
            return measurement.net;
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

type PhaseNetValues = {
    phaseA: number[];
    phaseB: (number | null)[];
    phaseC: (number | null)[];
    net: number[];
};

function getPhaseValuesFromPerPhaseNetMeasurements(
    measurements: PerPhaseNetMeasurement[],
): PhaseNetValues {
    return {
        phaseA: measurements.map((m) => m.phaseA),
        phaseB: measurements.map((m) => m.phaseB),
        phaseC: measurements.map((m) => m.phaseC),
        net: measurements.map((m) => m.net),
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

function getAverageFromPerPhaseNetMeasurements(
    phaseValues: PhaseNetValues,
): PerPhaseNetMeasurement {
    return {
        type: 'perPhaseNet',
        phaseA: averageNumbersArray(phaseValues.phaseA),
        phaseB: averageNumbersNullableArray(phaseValues.phaseB),
        phaseC: averageNumbersNullableArray(phaseValues.phaseC),
        net: averageNumbersArray(phaseValues.net),
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

function getMinimumFromPerPhaseNetMeasurements(
    phaseValues: PhaseNetValues,
): PerPhaseNetMeasurement {
    return {
        type: 'perPhaseNet',
        phaseA: Math.min(...phaseValues.phaseA),
        phaseB: mathMinNullableArray(phaseValues.phaseB),
        phaseC: mathMinNullableArray(phaseValues.phaseC),
        net: Math.min(...phaseValues.net),
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

function getMaximumFromPerPhaseNetMeasurements(
    phaseValues: PhaseNetValues,
): PerPhaseNetMeasurement {
    return {
        type: 'perPhaseNet',
        phaseA: Math.max(...phaseValues.phaseA),
        phaseB: mathMaxNullableArray(phaseValues.phaseB),
        phaseC: mathMaxNullableArray(phaseValues.phaseC),
        net: Math.max(...phaseValues.net),
    };
}

export type AvgMaxMin<T> = {
    average: T;
    maximum: T;
    minimum: T;
};

export function getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements(
    array: AssertedPerPhaseNetOrNoPhaseMeasurementArray,
): AvgMaxMin<PerPhaseNetMeasurement | NoPhaseMeasurement> {
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
        case 'perPhaseNet': {
            const phaseValues = getPhaseValuesFromPerPhaseNetMeasurements(
                array.measurements,
            );

            return {
                average: getAverageFromPerPhaseNetMeasurements(phaseValues),
                maximum: getMaximumFromPerPhaseNetMeasurements(phaseValues),
                minimum: getMinimumFromPerPhaseNetMeasurements(phaseValues),
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
