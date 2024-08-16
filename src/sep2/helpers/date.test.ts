import { describe, expect, it } from 'vitest';
import { dateToStringSeconds } from './date';

describe('dateToStringSeconds', () => {
    it('should convert a date to a string', () => {
        const date = new Date('2021-01-01T00:00:01Z');
        const result = dateToStringSeconds(date);

        expect(result).toEqual('1609459201');
    });

    it('should round milliseconds', () => {
        const date = new Date('2021-01-01T00:00:01.123Z');
        const result = dateToStringSeconds(date);

        expect(result).toEqual('1609459201');
    });
});
