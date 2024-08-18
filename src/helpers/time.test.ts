import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMillisecondsToNextHourMinutesInterval } from './time';

describe('getMillisecondsToNextHourInterval', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return the correct milliseconds for a 15-minute interval', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);
        const result = getMillisecondsToNextHourMinutesInterval(15);
        expect(result).toBe(10 * 60 * 1_000); // in 10 minutes
    });

    it('should return the correct milliseconds for a 30-minute interval', () => {
        const now = new Date('2023-01-01T10:45:15');
        vi.setSystemTime(now);
        const result = getMillisecondsToNextHourMinutesInterval(30);
        expect(result).toBe(14 * 60 * 1_000 + 45 * 1_000); // in 14 minutes 45 seconds
    });

    it('should return the correct milliseconds for a 29-minute interval', () => {
        const now = new Date('2023-01-01T10:00:01Z');
        vi.setSystemTime(now);
        const result = getMillisecondsToNextHourMinutesInterval(29);
        expect(result).toBe(28 * 60 * 1_000 + 59 * 1_000); // in 29 minutes 59 seconds
    });

    it('should return the correct milliseconds for a 1-minute interval', () => {
        const now = new Date('2023-01-01T10:59:05Z');
        vi.setSystemTime(now);
        const result = getMillisecondsToNextHourMinutesInterval(1);
        expect(result).toBe(55 * 1_000); // in 55 seconds
    });

    it('should throw for 31-minute interval', () => {
        const now = new Date('2023-01-01T10:00:00Z');
        vi.setSystemTime(now);
        expect(() => getMillisecondsToNextHourMinutesInterval(31)).toThrowError(
            'Interval must be <= 30 minutes',
        );
    });

    it('should throw for negative interval', () => {
        const now = new Date('2023-01-01T10:00:00Z');
        vi.setSystemTime(now);
        expect(() => getMillisecondsToNextHourMinutesInterval(-1)).toThrowError(
            'Interval must be greater than 0 minutes',
        );
    });

    it('should handle edge case where current time is exactly on the interval, return next interval', () => {
        const now = new Date('2023-01-01T10:15:00Z');
        vi.setSystemTime(now);
        const result = getMillisecondsToNextHourMinutesInterval(15);
        expect(result).toBe(15 * 60 * 1_000); // in 15 minutes
    });
});
