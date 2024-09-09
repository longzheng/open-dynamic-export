import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InverterControlLimit } from '../../../coordinator/helpers/inverterController.js';
import { SapnRELE2WLimiter } from './index.js';

describe('AusgridEA029Limiter', () => {
    let sapnRELE2WLimiter: SapnRELE2WLimiter;

    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();

        sapnRELE2WLimiter = new SapnRELE2WLimiter();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return correct control limit during charge window', () => {
        process.env.TZ = 'Australia/Adelaide';
        vi.setSystemTime(new Date('2024-01-01T10:30:00'));

        const result = sapnRELE2WLimiter.getInverterControlLimit();

        expect(result).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: 0,
            opModGenLimW: undefined,
        } satisfies InverterControlLimit);
    });

    it('should return no control limit outside of charge window', () => {
        process.env.TZ = 'Australia/Adelaide';
        vi.setSystemTime(new Date('2024-01-01T08:00:00'));

        const result = sapnRELE2WLimiter.getInverterControlLimit();

        expect(result).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: undefined,
            opModGenLimW: undefined,
        });
    });

    it('should throw exception when timezone is not NSW', () => {
        process.env.TZ = 'Australia/Perth';
        vi.setSystemTime(new Date('2024-01-01T08:00:00'));

        expect(() => sapnRELE2WLimiter.getInverterControlLimit()).toThrow(
            'Two-way tariff limiter requires the timezone to be set to SA',
        );
    });
});
