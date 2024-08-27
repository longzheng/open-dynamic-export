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

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(100);
    });

    it('should return ramped value after 5 seconds for default limit', () => {
        // start ramping
        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50);

        // after 5 seconds
        vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50.0135);
    });

    it('should not return change within the second', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.500Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50);

        vi.setSystemTime(new Date('2021-01-01T00:00:11Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50.0027);
    });

    it('should make progress even changing target every second', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50);

        vi.setSystemTime(new Date('2021-01-01T00:00:11Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 99,
            }),
        ).toBe(50.0027);

        vi.setSystemTime(new Date('2021-01-01T00:00:12Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50.0027,
                targetPowerRatio: 100,
            }),
        ).toBe(50.0054);

        vi.setSystemTime(new Date('2021-01-01T00:00:13Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50.0054,
                targetPowerRatio: 99,
            }),
        ).toBe(50.0081);
    });

    it('once reach target, reset ramping', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50);

        // start ramp up
        vi.setSystemTime(new Date('2021-01-01T00:02:00.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 50,
                targetPowerRatio: 100,
            }),
        ).toBe(50.297);

        // reached ramp target
        vi.setSystemTime(new Date('2021-01-01T00:05:00.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 100,
                targetPowerRatio: 100,
            }),
        ).toBe(100);

        // start ramp down
        vi.setSystemTime(new Date('2021-01-01T00:05:01.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 100,
                targetPowerRatio: 50,
            }),
        ).toBe(100);

        vi.setSystemTime(new Date('2021-01-01T00:05:02.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 100,
                targetPowerRatio: 50,
            }),
        ).toBe(99.9973);
    });
});
