import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RampRateHelper } from './rampRate';
import { afterEach } from 'node:test';

let helper: RampRateHelper;

beforeEach(() => {
    helper = new RampRateHelper();
});

afterEach(() => {
    vi.getRealSystemTime();
});

describe('getSetGradW', () => {
    it('should return default setGradW for null ramp rate', () => {
        helper.setRampRate(null);

        expect(helper.getDerSettingsSetGradW()).toBe(27);
    });

    it('should return 0 setGradW for 0 ramp rate', () => {
        helper.setRampRate(0);

        expect(helper.getDerSettingsSetGradW()).toBe(0);
    });

    it('should return 27 setGradW for 0.27% ramp rate', () => {
        helper.setRampRate(27);

        expect(helper.getDerSettingsSetGradW()).toBe(27);
    });
});

describe('calculateRampValue', () => {
    it('should return value immediately for no limit', () => {
        helper.setRampRate(0);

        expect(helper.calculateRampValue({ current: 50, target: 100 })).toBe(
            100,
        );
    });

    it('should return ramped value after 5 seconds for default limit', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));

        expect(helper.calculateRampValue({ current: 50, target: 100 })).toBe(
            50,
        );

        vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));

        expect(helper.calculateRampValue({ current: 50, target: 100 })).toBe(
            50.675,
        );
    });

    it('should make progress even changing target every 200ms', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.000Z'));

        expect(helper.calculateRampValue({ current: 50, target: 100 })).toBe(
            50,
        );

        vi.setSystemTime(new Date('2021-01-01T00:00:10.200Z'));

        expect(helper.calculateRampValue({ current: 50, target: 99 })).toBe(
            50.02646,
        );

        vi.setSystemTime(new Date('2021-01-01T00:00:10.400Z'));

        expect(
            helper.calculateRampValue({ current: 50.02646, target: 100 }),
        ).toBe(50.0534457116);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.600Z'));

        expect(
            helper.calculateRampValue({ current: 50.0534457116, target: 99 }),
        ).toBe(50.07987685091574);
    });

    it('once reach target, reset ramping', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.000Z'));

        expect(helper.calculateRampValue({ current: 50, target: 100 })).toBe(
            50,
        );

        // start ramp up
        vi.setSystemTime(new Date('2021-01-01T00:02:00.000Z'));

        expect(helper.calculateRampValue({ current: 50, target: 100 })).toBe(
            64.85,
        );

        // reached ramp target
        vi.setSystemTime(new Date('2021-01-01T00:05:00.000Z'));

        expect(helper.calculateRampValue({ current: 100, target: 100 })).toBe(
            100,
        );

        // start ramp down
        vi.setSystemTime(new Date('2021-01-01T00:05:01.000Z'));

        expect(helper.calculateRampValue({ current: 100, target: 50 })).toBe(
            100,
        );

        vi.setSystemTime(new Date('2021-01-01T00:05:02.000Z'));

        expect(helper.calculateRampValue({ current: 100, target: 50 })).toBe(
            99.865,
        );
    });
});
