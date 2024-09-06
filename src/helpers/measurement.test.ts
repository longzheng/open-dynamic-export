import { describe, it, expect } from 'vitest';
import type {
    PerPhaseMeasurement,
    NoPhaseMeasurement,
    AssertedPerPhaseOrNoPhaseMeasurementArray,
} from './measurement';
import {
    assertPerPhaseOrNoPhaseMeasurementArray,
    getAvgMaxMinOfNumbersNullable,
    getAvgMaxMinOfPerPhaseMeasurementsNullable,
    getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements,
    getTotalFromPerPhaseOrNoPhaseMeasurement,
} from './measurement';

describe('assertPerPhaseOrNoPhaseMeasurementArray', () => {
    it('should return perPhase when only perPhase measurements are present', () => {
        const perPhaseMeasurements: PerPhaseMeasurement[] = [
            { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
            { type: 'perPhase', phaseA: 40, phaseB: 50, phaseC: 60 },
        ];

        const result =
            assertPerPhaseOrNoPhaseMeasurementArray(perPhaseMeasurements);
        expect(result).toEqual({
            type: 'perPhase',
            measurements: perPhaseMeasurements,
        });
    });

    it('should return noPhase when only noPhase measurements are present', () => {
        const noPhaseMeasurements: NoPhaseMeasurement[] = [
            { type: 'noPhase', value: 100 },
            { type: 'noPhase', value: 200 },
        ];

        const result =
            assertPerPhaseOrNoPhaseMeasurementArray(noPhaseMeasurements);
        expect(result).toEqual({
            type: 'noPhase',
            measurements: noPhaseMeasurements,
        });
    });

    it('should prefer perPhase when both perPhase and noPhase measurements are present', () => {
        const mixedMeasurements: (PerPhaseMeasurement | NoPhaseMeasurement)[] =
            [
                { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
                { type: 'noPhase', value: 100 },
                { type: 'perPhase', phaseA: 40, phaseB: 50, phaseC: 60 },
            ];

        const result =
            assertPerPhaseOrNoPhaseMeasurementArray(mixedMeasurements);
        expect(result).toEqual({
            type: 'perPhase',
            measurements: [
                { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
                { type: 'perPhase', phaseA: 40, phaseB: 50, phaseC: 60 },
            ],
        });
    });

    it('should return empty perPhase array when no measurements are provided', () => {
        const emptyMeasurements: PerPhaseMeasurement[] = [];

        const result =
            assertPerPhaseOrNoPhaseMeasurementArray(emptyMeasurements);
        expect(result).toEqual({
            type: 'noPhase',
            measurements: [],
        });
    });
});

describe('getTotalFromPerPhaseOrNoPhaseMeasurement', () => {
    it('should return the value from noPhase measurement', () => {
        const noPhaseMeasurement: NoPhaseMeasurement = {
            type: 'noPhase',
            value: 100,
        };

        const result =
            getTotalFromPerPhaseOrNoPhaseMeasurement(noPhaseMeasurement);
        expect(result).toBe(100);
    });

    it('should return the sum of phaseA, phaseB, and phaseC when all phases are present in perPhase measurement', () => {
        const perPhaseMeasurement: PerPhaseMeasurement = {
            type: 'perPhase',
            phaseA: 10,
            phaseB: 20,
            phaseC: 30,
        };

        const result =
            getTotalFromPerPhaseOrNoPhaseMeasurement(perPhaseMeasurement);
        expect(result).toBe(10 + 20 + 30);
    });

    it('should return the sum of phases with null in perPhase measurement', () => {
        const perPhaseMeasurement: PerPhaseMeasurement = {
            type: 'perPhase',
            phaseA: 10,
            phaseB: 20,
            phaseC: null,
        };

        const result =
            getTotalFromPerPhaseOrNoPhaseMeasurement(perPhaseMeasurement);
        expect(result).toBe(10 + 20 + 0);
    });
});

describe('getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements', () => {
    it('should return correct average, maximum, and minimum for noPhase measurements', () => {
        const noPhaseMeasurements: AssertedPerPhaseOrNoPhaseMeasurementArray = {
            type: 'noPhase',
            measurements: [
                { type: 'noPhase', value: 100 },
                { type: 'noPhase', value: 200 },
                { type: 'noPhase', value: 300 },
            ],
        };

        const result =
            getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements(noPhaseMeasurements);
        expect(result).toEqual({
            average: { type: 'noPhase', value: 200 }, // (100 + 200 + 300) / 3 = 200
            maximum: { type: 'noPhase', value: 300 },
            minimum: { type: 'noPhase', value: 100 },
        });
    });

    it('should return correct average, maximum, and minimum for perPhase measurements', () => {
        const perPhaseMeasurements: AssertedPerPhaseOrNoPhaseMeasurementArray =
            {
                type: 'perPhase',
                measurements: [
                    { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
                    { type: 'perPhase', phaseA: 40, phaseB: 50, phaseC: 60 },
                    { type: 'perPhase', phaseA: 70, phaseB: 80, phaseC: 90 },
                ],
            };

        const result =
            getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements(perPhaseMeasurements);
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

    it('should return correct average, maximum, and minimum for perPhase measurements with nulls', () => {
        const perPhaseMeasurements: AssertedPerPhaseOrNoPhaseMeasurementArray =
            {
                type: 'perPhase',
                measurements: [
                    { type: 'perPhase', phaseA: 10, phaseB: 20, phaseC: 30 },
                    { type: 'perPhase', phaseA: 40, phaseB: null, phaseC: 60 },
                    { type: 'perPhase', phaseA: 70, phaseB: 80, phaseC: null },
                ],
            };

        const result =
            getAvgMaxMinOfPerPhaseOrNoPhaseMeasurements(perPhaseMeasurements);
        expect(result).toEqual({
            average: {
                type: 'perPhase',
                phaseA: 40, // (10 + 40 + 70) / 3 = 40
                phaseB: null,
                phaseC: null,
            },
            maximum: {
                type: 'perPhase',
                phaseA: 70,
                phaseB: null,
                phaseC: null,
            },
            minimum: {
                type: 'perPhase',
                phaseA: 10,
                phaseB: null,
                phaseC: null,
            },
        });
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
