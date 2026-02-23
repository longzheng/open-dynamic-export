import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getMillisecondsToNextUtcIntervalTick,
    getUtcTickStart,
} from './time.js';

describe('time helpers', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('getUtcTickStart', () => {
        it('should align to 5-minute UTC tick', () => {
            const tick = getUtcTickStart({
                intervalSeconds: 300,
                date: new Date('2023-01-01T10:07:45.900Z'),
            });

            expect(tick.toISOString()).toBe('2023-01-01T10:05:00.000Z');
        });

        it('should align to 1-minute UTC tick', () => {
            const tick = getUtcTickStart({
                intervalSeconds: 60,
                date: new Date('2023-01-01T10:07:45.900Z'),
            });

            expect(tick.toISOString()).toBe('2023-01-01T10:07:00.000Z');
        });

        it('should throw for invalid interval', () => {
            expect(() => getUtcTickStart({ intervalSeconds: 0 })).toThrowError(
                'Interval must be greater than 0 seconds',
            );
        });
    });

    describe('getMillisecondsToNextUtcIntervalTick', () => {
        it('should return the delay to next 5-minute UTC tick', () => {
            const now = new Date('2023-01-01T10:07:45.123Z');
            vi.setSystemTime(now);

            const result = getMillisecondsToNextUtcIntervalTick(300);
            const expectedNextTick = new Date('2023-01-01T10:10:00.000Z');

            expect(result).toBe(expectedNextTick.getTime() - now.getTime());
        });

        it('should return the delay to next 1-minute UTC tick', () => {
            const now = new Date('2023-01-01T10:07:45.123Z');
            vi.setSystemTime(now);

            const result = getMillisecondsToNextUtcIntervalTick(60);
            const expectedNextTick = new Date('2023-01-01T10:08:00.000Z');

            expect(result).toBe(expectedNextTick.getTime() - now.getTime());
        });

        it('should return full interval when exactly on tick boundary', () => {
            const now = new Date('2023-01-01T10:10:00.000Z');
            vi.setSystemTime(now);

            const result = getMillisecondsToNextUtcIntervalTick(300);
            const expectedNextTick = new Date('2023-01-01T10:15:00.000Z');

            expect(result).toBe(expectedNextTick.getTime() - now.getTime());
        });
    });
});
