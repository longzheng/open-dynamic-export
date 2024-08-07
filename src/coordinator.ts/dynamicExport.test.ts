import { describe, expect, it } from 'vitest';
import {
    calculateTargetSolarPowerRatio,
    calculateTargetSolarWatts,
    getWMaxLimPctFromTargetSolarPowerRatio,
} from './dynamicExport';

describe('calculateTargetSolarPowerRatio', () => {
    it('should calculate higher target ratio', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 5000,
            currentPowerRatio: 0.4,
            targetSolarWatts: 10000,
        });

        expect(targetPowerRatio).toBe(0.8);
    });

    it('should calculate lower target ratio', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 5000,
            currentPowerRatio: 0.4,
            targetSolarWatts: 4000,
        });

        expect(targetPowerRatio).toBe(0.32);
    });

    it('should cap target power ratio above 1.0 to 1.0', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 5000,
            currentPowerRatio: 0.5,
            targetSolarWatts: 20000,
        });

        expect(targetPowerRatio).toBe(1);
    });

    it('should not return target power ratio lower than 0.0', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 10,
            currentPowerRatio: 0,
            targetSolarWatts: 0,
        });

        expect(targetPowerRatio).toBe(0);
    });

    it('should return a hard-coded power ratio of 0.01 if current power ratio is 0 and target is greater', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 70.52,
            currentPowerRatio: 0,
            targetSolarWatts: 9000,
        });

        expect(targetPowerRatio).toBe(0.01);
    });

    it('should return a hard-coded power ratio of 0.01 if current power ratio is NaN and target is greater', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 70.52,
            currentPowerRatio: Number.NaN,
            targetSolarWatts: 9000,
        });

        expect(targetPowerRatio).toBe(0.01);
    });

    it('should return a hard-coded power ratio of 0 if current power ratio is 0 and target is lower', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 70.52,
            currentPowerRatio: 0,
            targetSolarWatts: 0,
        });

        expect(targetPowerRatio).toBe(0);
    });

    it('avoid floating point errors', () => {
        // these values don't make sense practically but is designed to test floating point errors
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            currentSolarWatts: 3,
            currentPowerRatio: 1,
            targetSolarWatts: 0.27,
        });

        expect(targetPowerRatio).toBe(0.09);
    });
});

describe('calculateTargetSolarWatts', () => {
    it('should calculate higher target if site is importing', () => {
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 2000,
            siteWatts: 5000,
            exportLimitWatts: 5000,
        });

        expect(targetSolar).toBe(12000);
    });

    it('should calculate higher target if site is exporting below export limit', () => {
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 5000,
            siteWatts: -4000,
            exportLimitWatts: 5000,
        });

        expect(targetSolar).toBe(6000);
    });

    it('should calculate lower target if site is exporting above export limit', () => {
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 8000,
            siteWatts: -7000,
            exportLimitWatts: 5000,
        });

        expect(targetSolar).toBe(6000);
    });

    it('avoid floating point errors', () => {
        // these values don't make sense practically but is designed to test floating point errors
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 8.13,
            siteWatts: -5.75,
            exportLimitWatts: 0,
        });

        expect(targetSolar).toBe(2.38);
    });
});

describe('getWMaxLimPctFromTargetSolarPowerRatio', () => {
    it('should handle WMaxLimPct_SF -2', () => {
        const WMaxLimPct = getWMaxLimPctFromTargetSolarPowerRatio({
            targetSolarPowerRatio: 1,
            controlsModel: {
                WMaxLimPct_SF: -2,
            },
        });

        expect(WMaxLimPct).toBe(10000);
    });

    it('should handle WMaxLimPct_SF 0', () => {
        const WMaxLimPct = getWMaxLimPctFromTargetSolarPowerRatio({
            targetSolarPowerRatio: 0.5,
            controlsModel: {
                WMaxLimPct_SF: 0,
            },
        });

        expect(WMaxLimPct).toBe(50);
    });
});
