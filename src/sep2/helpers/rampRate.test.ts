import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RampRateHelper, wgra4777PercentPerSecond } from './rampRate.js';

let helper: RampRateHelper;

beforeEach(() => {
    helper = new RampRateHelper();
});

afterEach(() => {
    vi.getRealSystemTime();
});

describe('getSetGradW', () => {
    it('should return the Wgra setGradW for null ramp rate', () => {
        helper.setDefaultDERControlRampRate(null);

        // with no setGradW set we fall back to the AS/NZS 4777.2 Wgra rate when
        // ramping to a DefaultDERControl, so that is what we report
        expect(helper.getDerSettingsSetGradW()).toBe(28);
    });

    it('should return the Wgra setGradW before any ramp rate is set', () => {
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

    it('should fall back to the Wgra rate before any setGradW is set', () => {
        helper.onDerSample({ nameplate: { maxW: 10000 } });

        const result = helper.getMaxChangeWatts();

        // CSIP-AUS note 2: ramping to a DefaultDERControl with no setGradW set
        // uses the AS/NZS 4777.2 Wgra rate
        expect(result).toStrictEqual({
            type: 'limited',
            wattsPerSecond: 10000 * (wgra4777PercentPerSecond / 100),
        } satisfies typeof result);
    });

    it('should fall back to the Wgra rate for null setGradW', () => {
        helper.onDerSample({ nameplate: { maxW: 10000 } });

        helper.setDefaultDERControlRampRate(null);

        const result = helper.getMaxChangeWatts();

        expect(result).toStrictEqual({
            type: 'limited',
            wattsPerSecond: 10000 * (wgra4777PercentPerSecond / 100),
        } satisfies typeof result);
    });

    it('should report whether a setGradW has been set', () => {
        expect(helper.hasSetGradW()).toBe(false);

        helper.setDefaultDERControlRampRate(null);
        expect(helper.hasSetGradW()).toBe(false);

        // a setGradW of 0 is an explicit "no limit", not an absent value
        helper.setDefaultDERControlRampRate(0);
        expect(helper.hasSetGradW()).toBe(true);

        helper.setDefaultDERControlRampRate(100);
        expect(helper.hasSetGradW()).toBe(true);
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
