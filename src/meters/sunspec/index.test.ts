import { describe, it, expect } from 'vitest';
import { convertConsumptionRealPowerToFeedInRealPower } from './index.js';
import { type SiteSampleData } from '../siteSample.js';
import { type DerSample } from '../../coordinator/helpers/derSample.js';

describe('convertConsumptionRealPowerToFeedInRealPower', () => {
    it('should convert noPhase real power correctly exporting', () => {
        const consumptionRealPower: SiteSampleData['realPower'] = {
            type: 'noPhase',
            net: -500,
        };

        const derRealPower: DerSample['realPower'] = {
            type: 'noPhase',
            net: 5000,
        };

        const result = convertConsumptionRealPowerToFeedInRealPower({
            consumptionRealPower,
            derRealPower,
        });

        expect(result).toEqual({
            type: 'noPhase',
            net: -4500,
        });
    });

    it('should convert noPhase real power correctly importing', () => {
        const consumptionRealPower: SiteSampleData['realPower'] = {
            type: 'noPhase',
            net: -7000,
        };

        const derRealPower: DerSample['realPower'] = {
            type: 'noPhase',
            net: 5000,
        };

        const result = convertConsumptionRealPowerToFeedInRealPower({
            consumptionRealPower,
            derRealPower,
        });

        expect(result).toEqual({
            type: 'noPhase',
            net: 2000,
        });
    });

    it('should handle null phases correctly in perPhaseNet real power', () => {
        const consumptionRealPower: SiteSampleData['realPower'] = {
            type: 'perPhaseNet',
            phaseA: -200,
            phaseB: -200,
            phaseC: -100,
            net: -500,
        };

        const derRealPower: DerSample['realPower'] = {
            type: 'perPhaseNet',
            phaseA: 5000,
            phaseB: 0,
            phaseC: 0,
            net: 5000,
        };

        const result = convertConsumptionRealPowerToFeedInRealPower({
            consumptionRealPower,
            derRealPower,
        });

        expect(result).toEqual({
            type: 'perPhaseNet',
            phaseA: -4800,
            phaseB: 200,
            phaseC: 100,
            net: -4500,
        });
    });

    it('should convert perPhaseNet real power correctly', () => {
        const consumptionRealPower: SiteSampleData['realPower'] = {
            type: 'perPhaseNet',
            phaseA: -200,
            phaseB: -200,
            phaseC: -100,
            net: -500,
        };

        const derRealPower: DerSample['realPower'] = {
            type: 'perPhaseNet',
            phaseA: 2000,
            phaseB: 2000,
            phaseC: 1000,
            net: 5000,
        };

        const result = convertConsumptionRealPowerToFeedInRealPower({
            consumptionRealPower,
            derRealPower,
        });

        expect(result).toEqual({
            type: 'perPhaseNet',
            phaseA: -1800,
            phaseB: -1800,
            phaseC: -900,
            net: -4500,
        });
    });
});
