import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AusgridEA029Limiter } from './index.js';

describe('AusgridEA029Limiter', () => {
    let ausgridEA029Limiter: AusgridEA029Limiter;

    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();

        ausgridEA029Limiter = new AusgridEA029Limiter();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return correct control limit during charge window', () => {
        process.env.TZ = 'Australia/Sydney';
        vi.setSystemTime(new Date('2024-01-01T10:30:00'));

        const result = ausgridEA029Limiter.getInverterControlLimit();

        expect(result).toEqual({
            source: 'twoWayTariff',
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: 0,
            opModGenLimW: undefined,
            opModImpLimW: undefined,
            opModLoadLimW: undefined,
        } satisfies typeof result);
    });

    it('should return no control limit outside of charge window', () => {
        process.env.TZ = 'Australia/Sydney';
        vi.setSystemTime(new Date('2024-01-01T08:00:00'));

        const result = ausgridEA029Limiter.getInverterControlLimit();

        expect(result).toEqual({
            source: 'twoWayTariff',
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: undefined,
            opModGenLimW: undefined,
            opModImpLimW: undefined,
            opModLoadLimW: undefined,
        } satisfies typeof result);
    });

    it('should throw exception when timezone is not NSW', () => {
        process.env.TZ = 'Australia/Perth';
        vi.setSystemTime(new Date('2024-01-01T08:00:00'));

        expect(() => ausgridEA029Limiter.getInverterControlLimit()).toThrow(
            'Two-way tariff limiter requires the timezone to be set to NSW',
        );
    });
});
