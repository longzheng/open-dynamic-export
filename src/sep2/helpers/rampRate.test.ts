import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultRampRatePercentPerSecond, RampRateHelper } from './rampRate.js';

let helper: RampRateHelper;

beforeEach(() => {
    helper = new RampRateHelper();
});

afterEach(() => {
    vi.getRealSystemTime();
});

describe('getSetGradW', () => {
    it('should return default setGradW for null ramp rate', () => {
        helper.setDefaultDERControlRampRate(null);

        expect(helper.getDerSettingsSetGradW()).toBe(28);
    });

    it('should return 0 setGradW for 0 ramp rate', () => {
        helper.setDefaultDERControlRampRate(0);

        expect(helper.getDerSettingsSetGradW()).toBe(0);
    });

    it('should return 100 setGradW for 1% ramp rate', () => {
        helper.setDefaultDERControlRampRate(100);

        expect(helper.getDerSettingsSetGradW()).toBe(100);
    });
});

describe('getMaxChangeWatts', () => {
    it('should return no limit for 0 setGradW', () => {
        helper.setDefaultDERControlRampRate(0);

        const result = helper.getMaxChangeWatts();

        expect(result).toStrictEqual({
            type: 'noLimit',
        } satisfies typeof result);
    });

    it('should return no limit for default ramp rate without nameplate', () => {
        const result = helper.getMaxChangeWatts();

        expect(result).toStrictEqual({
            type: 'noLimit',
        } satisfies typeof result);
    });

    it('should return limit for default ramp rate with nameplate', () => {
        helper.onDerSample({ nameplate: { maxW: 10000 } });

        const result = helper.getMaxChangeWatts();

        expect(result).toStrictEqual({
            type: 'limited',
            wattsPerSecond: 10000 * (defaultRampRatePercentPerSecond / 100),
        } satisfies typeof result);
    });

    it('should return no limit for 1% ramp rate without nameplate', () => {
        helper.setDefaultDERControlRampRate(100);

        const result = helper.getMaxChangeWatts();

        expect(result).toStrictEqual({
            type: 'noLimit',
        } satisfies typeof result);
    });

    it('should return limited for 1% ramp rate with nameplate', () => {
        helper.onDerSample({ nameplate: { maxW: 10000 } });

        helper.setDefaultDERControlRampRate(100);

        const result = helper.getMaxChangeWatts();

        expect(result).toStrictEqual({
            type: 'limited',
            wattsPerSecond:
                10000 *
                // 1%
                (1 / 100),
        } satisfies typeof result);
    });
});
