import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { siteSampleDataSchema } from './siteSample.js';

const validSiteSampleData = {
    realPower: {
        type: 'noPhase',
        net: 1000,
    },
    reactivePower: {
        type: 'noPhase',
        net: 200,
    },
    frequency: 50,
    voltage: {
        type: 'perPhase',
        phaseA: 230,
        phaseB: 231,
        phaseC: 229,
    },
};

describe('siteSampleDataSchema', () => {
    it('should allow non-negative frequency', () => {
        expect(
            v.safeParse(siteSampleDataSchema, {
                ...validSiteSampleData,
            }).success,
        ).toBe(true);
    });

    it('should reject negative frequency', () => {
        expect(
            v.safeParse(siteSampleDataSchema, {
                ...validSiteSampleData,
                frequency: -0.01,
            }).success,
        ).toBe(false);
    });

    it('should allow one phase voltage', () => {
        expect(
            v.safeParse(siteSampleDataSchema, {
                ...validSiteSampleData,
                voltage: {
                    type: 'perPhase',
                    phaseA: 230,
                    phaseB: null,
                    phaseC: null,
                },
            }).success,
        ).toBe(true);
    });

    it('should reject negative voltage', () => {
        expect(
            v.safeParse(siteSampleDataSchema, {
                ...validSiteSampleData,
                voltage: {
                    type: 'perPhase',
                    phaseA: -1,
                    phaseB: 231,
                    phaseC: 229,
                },
                frequency: 50,
            }).success,
        ).toBe(false);
    });
});
