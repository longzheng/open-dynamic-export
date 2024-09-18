import { describe, it, expect } from 'vitest';
import type {
    PerPhaseMeasurement,
    NoPhaseMeasurement,
    AssertedPerPhaseNetOrNoPhaseMeasurementArray,
    PerPhaseNetMeasurement,
} from './measurement.js';
import {
    assertPerPhaseNetOrNoPhaseMeasurementArray,
    getAvgMaxMinOfNumbersNullable,
    getAvgMaxMinOfPerPhaseMeasurementsNullable,
    getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements,
    getTotalFromPerPhaseNetOrNoPhaseMeasurement,
} from './measurement.js';

describe('assertPerPhaseOrNoPhaseMeasurementArray', () => {
    it('should return perPhase when only perPhase measurements are present', () => {
        const perPhaseNetMeasurements: PerPhaseNetMeasurement[] = [
            {
                type: 'perPhaseNet',
                phaseA: 10,
                phaseB: 20,
                phaseC: 30,
                net: 60,
            },
            {
                type: 'perPhaseNet',
                phaseA: 40,
                phaseB: 50,
                phaseC: 60,
                net: 150,
            },
        ];

        const result = assertPerPhaseNetOrNoPhaseMeasurementArray(
            perPhaseNetMeasurements,
        );
        expect(result).toEqual({
            type: 'perPhaseNet',
            measurements: perPhaseNetMeasurements,
        } satisfies AssertedPerPhaseNetOrNoPhaseMeasurementArray);
    });

    it('should return noPhase when only noPhase measurements are present', () => {
        const noPhaseMeasurements: NoPhaseMeasurement[] = [
            { type: 'noPhase', net: 100 },
            { type: 'noPhase', net: 200 },
        ];

        const result =
            assertPerPhaseNetOrNoPhaseMeasurementArray(noPhaseMeasurements);
        expect(result).toEqual({
            type: 'noPhase',
            measurements: noPhaseMeasurements,
        });
    });

    it('should prefer perPhase when both perPhase and noPhase measurements are present', () => {
        const mixedMeasurements: (
            | PerPhaseNetMeasurement
            | NoPhaseMeasurement
        )[] = [
            {
                type: 'perPhaseNet',
                phaseA: 10,
                phaseB: 20,
                phaseC: 30,
                net: 60,
            },
            { type: 'noPhase', net: 100 },
            {
                type: 'perPhaseNet',
                phaseA: 40,
                phaseB: 50,
                phaseC: 60,
                net: 150,
            },
        ];

        const result =
            assertPerPhaseNetOrNoPhaseMeasurementArray(mixedMeasurements);
        expect(result).toEqual({
            type: 'perPhaseNet',
            measurements: [
                {
                    type: 'perPhaseNet',
                    phaseA: 10,
                    phaseB: 20,
                    phaseC: 30,
                    net: 60,
                },
                {
                    type: 'perPhaseNet',
                    phaseA: 40,
                    phaseB: 50,
                    phaseC: 60,
                    net: 150,
                },
            ],
        } satisfies AssertedPerPhaseNetOrNoPhaseMeasurementArray);
    });

    it('should return empty perPhase array when no measurements are provided', () => {
        const emptyMeasurements: PerPhaseNetMeasurement[] = [];

        const result =
            assertPerPhaseNetOrNoPhaseMeasurementArray(emptyMeasurements);
        expect(result).toEqual({
            type: 'noPhase',
            measurements: [],
        } satisfies AssertedPerPhaseNetOrNoPhaseMeasurementArray);
    });
});

describe('getTotalFromPerPhaseOrNoPhaseMeasurement', () => {
    it('should return the value from noPhase measurement', () => {
        const noPhaseMeasurement: NoPhaseMeasurement = {
            type: 'noPhase',
            net: 100,
        };

        const result =
            getTotalFromPerPhaseNetOrNoPhaseMeasurement(noPhaseMeasurement);
        expect(result).toBe(100);
    });

    it('should return the sum of phaseA, phaseB, and phaseC when all phases are present in perPhase measurement', () => {
        const perPhaseMeasurement: PerPhaseNetMeasurement = {
            type: 'perPhaseNet',
            phaseA: 10,
            phaseB: 20,
            phaseC: 30,
            net: 60,
        };

        const result =
            getTotalFromPerPhaseNetOrNoPhaseMeasurement(perPhaseMeasurement);
        expect(result).toBe(10 + 20 + 30);
    });

    it('should return the sum of phases with null in perPhase measurement', () => {
        const perPhaseMeasurement: PerPhaseNetMeasurement = {
            type: 'perPhaseNet',
            phaseA: 10,
            phaseB: 20,
            phaseC: null,
            net: 30,
        };

        const result =
            getTotalFromPerPhaseNetOrNoPhaseMeasurement(perPhaseMeasurement);
        expect(result).toBe(10 + 20 + 0);
    });
});

describe('getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements', () => {
    it('should return correct average, maximum, and minimum for noPhase measurements', () => {
        const noPhaseMeasurements: AssertedPerPhaseNetOrNoPhaseMeasurementArray =
            {
                type: 'noPhase',
                measurements: [
                    { type: 'noPhase', net: 100 },
                    { type: 'noPhase', net: 200 },
                    { type: 'noPhase', net: 300 },
                ],
            };

        const result =
            getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements(noPhaseMeasurements);
        expect(result).toEqual({
            average: { type: 'noPhase', net: 200 }, // (100 + 200 + 300) / 3 = 200
            maximum: { type: 'noPhase', net: 300 },
            minimum: { type: 'noPhase', net: 100 },
        });
    });

    it('should return correct average, maximum, and minimum for perPhase measurements', () => {
        const perPhaseMeasurements: AssertedPerPhaseNetOrNoPhaseMeasurementArray =
            {
                type: 'perPhaseNet',
                measurements: [
                    {
                        type: 'perPhaseNet',
                        phaseA: 10,
                        phaseB: 20,
                        phaseC: 30,
                        net: 60,
                    },
                    {
                        type: 'perPhaseNet',
                        phaseA: 40,
                        phaseB: 50,
                        phaseC: 60,
                        net: 150,
                    },
                    {
                        type: 'perPhaseNet',
                        phaseA: 70,
                        phaseB: 80,
                        phaseC: 90,
                        net: 240,
                    },
                ],
            };

        const result =
            getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements(
                perPhaseMeasurements,
            );
        expect(result).toEqual({
            average: {
                type: 'perPhaseNet',
                phaseA: 40, // (10 + 40 + 70) / 3 = 40
                phaseB: 50, // (20 + 50 + 80) / 3 = 50
                phaseC: 60, // (30 + 60 + 90) / 3 = 60
                net: 150, // (60 + 150 + 240) / 3 = 150
            },
            maximum: {
                type: 'perPhaseNet',
                phaseA: 70,
                phaseB: 80,
                phaseC: 90,
                net: 240,
            },
            minimum: {
                type: 'perPhaseNet',
                phaseA: 10,
                phaseB: 20,
                phaseC: 30,
                net: 60,
            },
        } satisfies ReturnType<
            typeof getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements
        >);
    });

    it('should return correct average, maximum, and minimum for perPhase measurements with nulls', () => {
        const perPhaseMeasurements: AssertedPerPhaseNetOrNoPhaseMeasurementArray =
            {
                type: 'perPhaseNet',
                measurements: [
                    {
                        type: 'perPhaseNet',
                        phaseA: 10,
                        phaseB: 20,
                        phaseC: 30,
                        net: 60,
                    },
                    {
                        type: 'perPhaseNet',
                        phaseA: 40,
                        phaseB: null,
                        phaseC: 60,
                        net: 100,
                    },
                    {
                        type: 'perPhaseNet',
                        phaseA: 70,
                        phaseB: 80,
                        phaseC: null,
                        net: 150,
                    },
                ],
            };

        const result =
            getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements(
                perPhaseMeasurements,
            );
        expect(result).toEqual({
            average: {
                type: 'perPhaseNet',
                phaseA: 40, // (10 + 40 + 70) / 3 = 40
                phaseB: 50,
                phaseC: 45,
                net: (60 + 100 + 150) / 3, // (60 + 100 + 150) / 3 = 103.33333333333333
            },
            maximum: {
                type: 'perPhaseNet',
                phaseA: 70,
                phaseB: 80,
                phaseC: 60,
                net: 150,
            },
            minimum: {
                type: 'perPhaseNet',
                phaseA: 10,
                phaseB: 20,
                phaseC: 30,
                net: 60,
            },
        } satisfies ReturnType<
            typeof getAvgMaxMinOfPerPhaseNetOrNoPhaseMeasurements
        >);
    });
});

describe('getAvgMaxMinOfPerPhaseMeasurementsNullable', () => {
    it('should return correct average, maximum, and minimum for non-null perPhase measurements', () => {
        const perPhaseMeasurements: (PerPhaseMeasurement | null)[] = [
            { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
            { type: 'perPhase', phaseA: 40, phaseB: 50, phaseC: 60 },
            { type: 'perPhase', phaseA: 70, phaseB: 80, phaseC: 90 },
        ];

        const result =
            getAvgMaxMinOfPerPhaseMeasurementsNullable(perPhaseMeasurements);
        expect(result).toEqual({
            average: {
                type: 'perPhase',
                phaseA: 40, // (10 + 40 + 70) / 3 = 40
                phaseB: 50, // (20 + 50 + 80) / 3 = 50
                phaseC: 60, // (30 + 60 + 90) / 3 = 60
            },
            maximum: {
                type: 'perPhase',
                phaseA: 70,
                phaseB: 80,
                phaseC: 90,
            },
            minimum: {
                type: 'perPhase',
                phaseA: 10,
                phaseB: 20,
                phaseC: 30,
            },
        });
    });

    it('should return null when the array contains null values', () => {
        const perPhaseMeasurements: (PerPhaseMeasurement | null)[] = [
            { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
            null,
            { type: 'perPhase', phaseA: 40, phaseB: 50, phaseC: 60 },
        ];

        const result =
            getAvgMaxMinOfPerPhaseMeasurementsNullable(perPhaseMeasurements);
        expect(result).toBeNull();
    });
});

describe('getAvgMaxMinOfNumbersNullable', () => {
    it('should return correct average, maximum, and minimum for non-null numbers', () => {
        const numbers: (number | null)[] = [10, 20, 30];

        const result = getAvgMaxMinOfNumbersNullable(numbers);
        expect(result).toEqual({
            average: 20, // (10 + 20 + 30) / 3 = 20
            maximum: 30,
            minimum: 10,
        });
    });

    it('should return null when the array contains null values', () => {
        const numbers: (number | null)[] = [10, null, 30];

        const result = getAvgMaxMinOfNumbersNullable(numbers);
        expect(result).toBeNull();
    });
});
