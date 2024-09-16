import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateDerSample } from './derSample.js';
import type { InverterData } from './inverterData.js';

describe('generateDerSample', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return a DerSample for a single inverter', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);

        const invertersData: Pick<InverterData, 'inverter'>[] = [
            {
                inverter: {
                    realPower: 6990,
                    reactivePower: -25,
                    voltagePhaseA: 230.1,
                    voltagePhaseB: 227.7,
                    voltagePhaseC: 229,
                    frequency: 49.99,
                },
            },
        ];

        const result = generateDerSample({ invertersData });

        expect(result).toStrictEqual({
            date: now,
            realPower: {
                type: 'noPhase',
                value: 6990,
            },
            reactivePower: {
                type: 'noPhase',
                value: -25,
            },
            voltage: {
                type: 'perPhase',
                phaseA: 230.1,
                phaseB: 227.7,
                phaseC: 229.0,
            },
            frequency: 49.99,
        });
    });

    it('should return a DerSample for a multiple inverters', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);

        const invertersData: Pick<InverterData, 'inverter'>[] = [
            {
                inverter: {
                    realPower: 6990,
                    reactivePower: -25,
                    voltagePhaseA: 230.1,
                    voltagePhaseB: 227.7,
                    voltagePhaseC: 229,
                    frequency: 49.99,
                },
            },
            {
                inverter: {
                    realPower: 6990,
                    reactivePower: -25,
                    voltagePhaseA: 230.1,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50,
                },
            },
        ];

        const result = generateDerSample({ invertersData });

        expect(result).toStrictEqual({
            date: now,
            realPower: {
                type: 'noPhase',
                value: 13980,
            },
            reactivePower: {
                type: 'noPhase',
                value: -50,
            },
            voltage: {
                type: 'perPhase',
                phaseA: 230.1,
                phaseB: null,
                phaseC: null,
            },
            frequency: 49.995,
        });
    });
});
