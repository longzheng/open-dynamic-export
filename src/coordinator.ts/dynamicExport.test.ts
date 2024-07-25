import { describe, expect, it } from 'vitest';
import {
    calculateTargetSolarPowerRatio,
    calculateTargetSolarWatts,
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
});
