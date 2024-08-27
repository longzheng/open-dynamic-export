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
                currentPowerRatio: 0.5,
                targetPowerRatio: 1.0,
            }),
        ).toBe(1.0);
    });

    it('should return ramped value after 5 seconds for default limit', () => {
        // start ramping
        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1,
            }),
        ).toBe(0.5);

        // after 5 seconds
        vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1.0,
            }),
        ).toBe(0.5135);
    });

    it('should not return change if change is less than 0.01%', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1.0,
            }),
        ).toBe(0.5);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.010Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1.0,
            }),
        ).toBe(0.5);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.100Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1.0,
            }),
        ).toBe(0.50027);
    });

    it('should make progress even changing target every second', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1.0,
            }),
        ).toBe(0.5);

        vi.setSystemTime(new Date('2021-01-01T00:00:11Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 0.99,
            }),
        ).toBe(0.5027);

        vi.setSystemTime(new Date('2021-01-01T00:00:12Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5027,
                targetPowerRatio: 1,
            }),
        ).toBe(0.5054);

        vi.setSystemTime(new Date('2021-01-01T00:00:13Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5054,
                targetPowerRatio: 0.99,
            }),
        ).toBe(0.5081);
    });

    it('once reach target, reset ramping', () => {
        helper.setRampRate(27);

        vi.setSystemTime(new Date('2021-01-01T00:00:10.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1,
            }),
        ).toBe(0.5);

        // start ramp up
        vi.setSystemTime(new Date('2021-01-01T00:02:00.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 0.5,
                targetPowerRatio: 1,
            }),
        ).toBe(0.797);

        // reached ramp target
        vi.setSystemTime(new Date('2021-01-01T00:05:00.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 1,
                targetPowerRatio: 1,
            }),
        ).toBe(1);

        // start ramp down
        vi.setSystemTime(new Date('2021-01-01T00:05:01.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 1,
                targetPowerRatio: 0.5,
            }),
        ).toBe(1);

        vi.setSystemTime(new Date('2021-01-01T00:05:02.000Z'));

        expect(
            helper.calculateRampValue({
                currentPowerRatio: 1,
                targetPowerRatio: 0.5,
            }),
        ).toBe(0.9973);
    });
});
