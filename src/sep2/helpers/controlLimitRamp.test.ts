import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addSeconds } from 'date-fns';
import {
    ControlLimitRampHelper,
    calculateRampedValue,
    rampTmsToSeconds,
} from './controlLimitRamp.js';
import { RampRateHelper } from './rampRate.js';

afterEach(() => {
    vi.getRealSystemTime();
});

describe('rampTmsToSeconds', () => {
    it('should convert hundredths of a second to seconds', () => {
        expect(rampTmsToSeconds(6000)).toBe(60);
        expect(rampTmsToSeconds(100)).toBe(1);
        expect(rampTmsToSeconds(50)).toBe(0.5);
        expect(rampTmsToSeconds(33)).toBe(0.33);
    });

    it('should pass through zero and undefined', () => {
        expect(rampTmsToSeconds(0)).toBe(0);
        expect(rampTmsToSeconds(undefined)).toBe(undefined);
    });
});

describe('ControlLimitRampHelper', () => {
    let rampRateHelper: RampRateHelper;
    let helper: ControlLimitRampHelper;

    beforeEach(() => {
        rampRateHelper = new RampRateHelper();
        helper = new ControlLimitRampHelper({ rampRateHelper });
    });

    it('should return no value for no target with undefined', () => {
        helper.updateTarget({ type: 'none', value: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(undefined);

        expect(helper.getRampedValue()).toBe(undefined);
    });

    it('should return a value for no target with a value', () => {
        helper.updateTarget({ type: 'none', value: 5000 });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        expect(helper.getRampedValue()).toBe(5000);
    });

    it('should return no value for undefined target', () => {
        helper.updateTarget({
            type: 'active',
            value: undefined,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(undefined);

        expect(helper.getRampedValue()).toBe(undefined);
    });

    it('should return no value for undefined target with total nameplate', () => {
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'active',
            value: undefined,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(undefined);

        expect(helper.getRampedValue()).toBe(undefined);
    });

    it('should return active target value immediately if first time ramping', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));

        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        expect(helper.getRampedValue()).toBe(5000);
    });

    it('should return default target value immediately if first time ramping', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));

        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'default',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        expect(helper.getRampedValue()).toBe(5000);
    });

    it('should ramp at setGradW when going from active to active', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        // setGradW = 1%/second, so 100 W/s against a 10kW nameplate
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new active target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'active',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        // a control with no rampTms still ramps at setGradW rather than
        // stepping: 3500W at 100 W/s takes 35 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:20Z'));
        expect(helper.getRampedValue()).toBe(3000);

        vi.setSystemTime(new Date('2021-01-01T01:00:35Z'));
        expect(helper.getRampedValue()).toBe(1500);
    });

    // CACTUS ALL-25 "Active control ramp rates": setGradW is set to 100 (1%/s)
    // on the first default control poll, then a 30% control with a 60s rampTms
    // is followed by an overlapping 50% control with no rampTms. The second
    // transition must ramp at setGradW rather than stepping.
    it('should match CACTUS ALL-25 active control ramp rates', () => {
        const base = new Date('2021-01-01T00:00:00Z').getTime();
        vi.setSystemTime(new Date(base));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({ nameplate: { maxW: 10000 } });

        // (a, b) control 1: 30% of setMaxW, ramp_time_seconds 60
        // (c, d) control 2: 50% of setMaxW, no ramp time, arriving at t=130
        // the rate ramp measures from the previous poll, so tick every second
        // the way the control loop does
        const seen = new Map<number, number | undefined>();
        for (let t = 0; t <= 160; t++) {
            vi.setSystemTime(new Date(base + t * 1000));
            helper.updateTarget(
                t < 10
                    ? // precondition: DER exporting unconstrained
                      {
                          type: 'active',
                          value: 10000,
                          rampTimeSeconds: undefined,
                      }
                    : t < 130
                      ? { type: 'active', value: 3000, rampTimeSeconds: 60 }
                      : {
                            type: 'active',
                            value: 5000,
                            rampTimeSeconds: undefined,
                        },
            );
            seen.set(t, helper.getRampedValue());
        }

        // control 1 ramps over its 60s rampTms, reaching 30% at t=70
        expect(seen.get(40)).toBeGreaterThan(3000);
        expect(seen.get(40)).toBeLessThan(10000);
        expect(seen.get(70)).toBe(3000);

        // control 2 has no rampTms, so it ramps at setGradW rather than
        // stepping: 2000W at 100 W/s takes 20 seconds, the first 100W of which
        // is applied on the tick the control arrives
        expect(seen.get(130)).toBe(3100);
        expect(seen.get(140)).toBe(4100);
        expect(seen.get(150)).toBe(5000);
    });

    it('should soft-start to a DERControl in 15s when no setGradW is set', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        // no setDefaultDERControlRampRate call: the utility server has not sent
        // a setGradW, as in the ALL28 precondition
        rampRateHelper.onDerSample({ nameplate: { maxW: 5000 } });

        helper.updateTarget({
            type: 'active',
            value: 1500,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(1500);

        // 30% -> 10% of a 5kW setMaxW, the ALL28 transition that must complete
        // within 15s rather than the 72s the Wgra rate would have taken
        helper.updateTarget({
            type: 'active',
            value: 500,
            rampTimeSeconds: undefined,
        });

        vi.setSystemTime(new Date('2021-01-01T00:00:07Z'));
        expect(helper.getRampedValue()).toBeCloseTo(1033, 0);

        vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
        expect(helper.getRampedValue()).toBe(500);
    });

    it('should ramp to a DefaultDERControl at the Wgra rate when no setGradW is set', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.onDerSample({ nameplate: { maxW: 5000 } });

        helper.updateTarget({
            type: 'active',
            value: 1500,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(1500);

        // falling back to the default control gets no 15s soft-start: CSIP-AUS
        // note 2 requires the Wgra rate, which is 13.89 W/s against 5kW
        helper.updateTarget({
            type: 'default',
            value: 0,
            rampTimeSeconds: undefined,
        });

        vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
        expect(helper.getRampedValue()).toBeCloseTo(1500 - 13.89 * 15, 0);
    });

    it('should still ramp from a default target once setGradW is set', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        // setGradW = 1%/second, so 50 W/s against a 5kW nameplate
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({ nameplate: { maxW: 5000 } });

        helper.updateTarget({
            type: 'default',
            value: 0,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(0);

        helper.updateTarget({
            type: 'active',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        // 1500W at 50 W/s takes 30 seconds, so it must not step
        vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
        expect(helper.getRampedValue()).toBeCloseTo(750, 0);

        vi.setSystemTime(new Date('2021-01-01T00:00:30Z'));
        expect(helper.getRampedValue()).toBe(1500);
    });

    it('should apply a target whose rampTms changed but whose value did not', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({ nameplate: { maxW: 5000 } });

        helper.updateTarget({
            type: 'active',
            value: 1000,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(1000);

        // reach 2000W via an explicit ramp so the next target starts from there
        helper.updateTarget({
            type: 'active',
            value: 2000,
            rampTimeSeconds: 10,
        });
        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
        expect(helper.getRampedValue()).toBe(2000);

        // a replacement control with a 60 second rampTms
        helper.updateTarget({
            type: 'active',
            value: 3000,
            rampTimeSeconds: 60,
        });
        vi.setSystemTime(new Date('2021-01-01T00:00:40Z'));
        expect(helper.getRampedValue()).toBeCloseTo(2500, 0);
    });

    it('should complete a rampTms ramp in hundredths of a second, not seconds', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.onDerSample({
            nameplate: { maxW: 5000 },
        });

        helper.updateTarget({
            type: 'active',
            value: 333,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(333);

        // a DERControl with rampTms 6000 (hundredths) = 60 seconds
        helper.updateTarget({
            type: 'active',
            value: 2500,
            rampTimeSeconds: rampTmsToSeconds(6000),
        });

        // halfway through the 60 second ramp
        vi.setSystemTime(new Date('2021-01-01T00:00:30Z'));
        expect(helper.getRampedValue()).toBeCloseTo(1416.5, 0);

        // the ramp has completed by 60 seconds
        vi.setSystemTime(new Date('2021-01-01T00:01:00Z'));
        expect(helper.getRampedValue()).toBe(2500);
    });

    it('should return ramped value with 1% ramp rate if going from active to default', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new default target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(5000);

        // after 1 second
        vi.setSystemTime(new Date('2021-01-01T01:00:01Z'));
        expect(helper.getRampedValue()).toBe(5000 - 10000 * (1 / 100) * 1);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:30Z'));
        expect(helper.getRampedValue()).toBe(5000 - 10000 * (1 / 100) * 30);

        // after 5 minutes
        vi.setSystemTime(new Date('2021-01-01T01:05:00Z'));
        expect(helper.getRampedValue()).toBe(1500);
    });

    it('should return ramped value with 1% ramp rate if going from default to active', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });
        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(1500);

        // new active target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(1500);

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(1500);

        // after 1 second
        vi.setSystemTime(new Date('2021-01-01T01:00:01Z'));
        expect(helper.getRampedValue()).toBe(1500 + 10000 * (1 / 100) * 1);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:30Z'));
        expect(helper.getRampedValue()).toBe(1500 + 10000 * (1 / 100) * 30);

        // after 5 minutes
        vi.setSystemTime(new Date('2021-01-01T01:05:00Z'));
        expect(helper.getRampedValue()).toBe(5000);

        // new active target (new hour)
        vi.setSystemTime(new Date('2021-01-01T02:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'active',
            value: 10000,
            rampTimeSeconds: undefined,
        });

        // active to active ramps at setGradW too: 5000W at 100 W/s takes 50s
        vi.setSystemTime(new Date('2021-01-01T02:00:25Z'));
        expect(helper.getRampedValue()).toBe(7500);

        vi.setSystemTime(new Date('2021-01-01T02:00:50Z'));
        expect(helper.getRampedValue()).toBe(10000);
    });

    it('should return ramped value with 1% ramp rate if going from default to default', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });
        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(1500);

        // new default target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(1500);

        helper.updateTarget({
            type: 'default',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(1500);

        // after 1 second
        vi.setSystemTime(new Date('2021-01-01T01:00:01Z'));
        expect(helper.getRampedValue()).toBe(1500 + 10000 * (1 / 100) * 1);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:30Z'));
        expect(helper.getRampedValue()).toBe(1500 + 10000 * (1 / 100) * 30);

        // after 5 minutes
        vi.setSystemTime(new Date('2021-01-01T01:05:00Z'));
        expect(helper.getRampedValue()).toBe(5000);

        // new default target (new hour)
        vi.setSystemTime(new Date('2021-01-01T02:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'default',
            value: 3000,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(5000);

        // after 1 second
        vi.setSystemTime(new Date('2021-01-01T02:00:01Z'));
        expect(helper.getRampedValue()).toBe(5000 - 10000 * (1 / 100) * 1);
    });

    it('should return ramped value with timed ramping', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));

        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new active target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'active',
            value: 1500,
            rampTimeSeconds: 5,
        });

        expect(helper.getRampedValue()).toBe(5000);

        // after 1 second
        vi.setSystemTime(new Date('2021-01-01T01:00:01Z'));
        expect(helper.getRampedValue()).toBe(5000 - ((5000 - 1500) / 5) * 1);

        // after 3 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:03Z'));
        expect(helper.getRampedValue()).toBe(5000 - ((5000 - 1500) / 5) * 3);

        // after 5 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:05Z'));
        expect(helper.getRampedValue()).toBe(1500);

        // after 10 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:10Z'));
        expect(helper.getRampedValue()).toBe(1500);

        // new active target (new hour)
        vi.setSystemTime(new Date('2021-01-01T02:00:00Z'));

        expect(helper.getRampedValue()).toBe(1500);

        helper.updateTarget({
            type: 'active',
            value: 3000,
            rampTimeSeconds: 5,
        });

        expect(helper.getRampedValue()).toBe(1500);

        // after 1 second
        vi.setSystemTime(new Date('2021-01-01T02:00:01Z'));
        expect(helper.getRampedValue()).toBe(1500 + ((3000 - 1500) / 5) * 1);

        // after 3 seconds
        vi.setSystemTime(new Date('2021-01-01T02:00:03Z'));
        expect(helper.getRampedValue()).toBe(1500 + ((3000 - 1500) / 5) * 3);

        // after 5 seconds
        vi.setSystemTime(new Date('2021-01-01T02:00:05Z'));
        expect(helper.getRampedValue()).toBe(3000);

        // after 10 seconds
        vi.setSystemTime(new Date('2021-01-01T02:00:10Z'));
        expect(helper.getRampedValue()).toBe(3000);
    });

    it('should ramp from active to default, before reach default, ramp back to active', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });
        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new default target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(5000);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:30Z'));
        const rampedValue1 = helper.getRampedValue();
        expect(rampedValue1).toBe(5000 - 10000 * (1 / 100) * 30);

        // new active target
        helper.updateTarget({
            type: 'active',
            value: 10000,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(rampedValue1);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:01:00Z'));
        const rampedValue2 = helper.getRampedValue();
        expect(rampedValue2).toBe(rampedValue1! + 10000 * (1 / 100) * 30);

        // after 5 minutes
        vi.setSystemTime(new Date('2021-01-01T01:05:00Z'));
        const rampedValue3 = helper.getRampedValue();
        expect(rampedValue3).toBe(10000);

        // new active target
        helper.updateTarget({
            type: 'active',
            value: 20000,
            rampTimeSeconds: undefined,
        });

        // active to active ramps at setGradW: 10000W at 100 W/s takes 100s
        vi.setSystemTime(new Date('2021-01-01T01:05:50Z'));
        expect(helper.getRampedValue()).toBe(15000);

        vi.setSystemTime(new Date('2021-01-01T01:06:40Z'));
        expect(helper.getRampedValue()).toBe(20000);
    });

    it('should ramp from default to active, before reach active, ramp back to default', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });
        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(1500);

        // new active target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(1500);

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(1500);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:30Z'));
        const rampedValue1 = helper.getRampedValue();
        expect(rampedValue1).toBe(1500 + 10000 * (1 / 100) * 30);

        // new default target
        helper.updateTarget({
            type: 'default',
            value: 500,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(rampedValue1);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:01:00Z'));
        const rampedValue2 = helper.getRampedValue();
        expect(rampedValue2).toBe(rampedValue1! - 10000 * (1 / 100) * 30);

        // after 5 minutes
        vi.setSystemTime(new Date('2021-01-01T01:05:00Z'));
        const rampedValue3 = helper.getRampedValue();
        expect(rampedValue3).toBe(500);

        // new active target
        helper.updateTarget({
            type: 'active',
            value: 10000,
            rampTimeSeconds: undefined,
        });
        expect(helper.getRampedValue()).toBe(500);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:05:30Z'));
        const rampedValue4 = helper.getRampedValue();
        expect(rampedValue4).toBe(500 + 10000 * (1 / 100) * 30);
    });

    it('should return new target value immediately from active to default with no limit ramp rate', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(0);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new default target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(1500);
    });

    it('should return new target value immediately from default to active with no limit ramp rate', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(0);
        rampRateHelper.onDerSample({
            nameplate: { maxW: 10000 },
        });

        helper.updateTarget({
            type: 'default',
            value: 1500,
            rampTimeSeconds: undefined,
        });

        // cache initial value
        expect(helper.getRampedValue()).toBe(1500);

        // new default target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(1500);

        helper.updateTarget({
            type: 'active',
            value: 5000,
            rampTimeSeconds: undefined,
        });

        expect(helper.getRampedValue()).toBe(5000);
    });
});

describe('calculateRampedValue', () => {
    it('should return correct value for no limit increasing', () => {
        // start
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        expect(
            calculateRampedValue({
                lastValue: 500,
                lastValueTime: new Date('2021-01-01T00:00:00Z'),
                toValue: 1000,
                ramping: {
                    type: 'noLimit',
                },
            }),
        ).toBe(1000);

        // after
        vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
        expect(
            calculateRampedValue({
                lastValue: 500,
                lastValueTime: new Date('2021-01-01T00:00:00Z'),
                toValue: 1000,
                ramping: {
                    type: 'noLimit',
                },
            }),
        ).toBe(1000);
    });

    describe('time ramping', () => {
        it('should return correct value for time ramping', () => {
            const startDate = new Date('2021-01-01T00:00:00Z');

            // start
            vi.setSystemTime(startDate);
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: startDate,
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(500);

            // during
            vi.setSystemTime(new Date('2021-01-01T00:00:05Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: startDate,
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(500 + ((1000 - 500) / 10) * 5);

            // end
            vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: startDate,
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(1000);

            // after
            vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: startDate,
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(1000);
        });

        it('should return correct value for time ramping with progressive change', () => {
            const startDate = new Date('2021-01-01T00:00:00Z');
            const durationSeconds = 10;
            const endTime = addSeconds(startDate, durationSeconds);
            const startValue = 1000;
            const endValue = 500;

            let lastValue = startValue;
            let lastValueTime = startDate;

            // during with progressive change
            for (let i = 1; i < 10; i++) {
                vi.setSystemTime(addSeconds(startDate, i));

                const result = calculateRampedValue({
                    lastValue,
                    lastValueTime,
                    toValue: endValue,
                    ramping: {
                        type: 'time',
                        endTime,
                    },
                });

                expect(result).toBe(
                    startValue +
                        ((endValue - startValue) / durationSeconds) * i,
                );

                lastValue = result;
                lastValueTime = new Date();
            }
        });

        it('should return correct value for time ramping with sub-second', () => {
            // start
            vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:00.500Z'),
                    },
                }),
            ).toBe(500);

            // during
            vi.setSystemTime(new Date('2021-01-01T00:00:00.100Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:00.500Z'),
                    },
                }),
            ).toBe(600);

            // end
            vi.setSystemTime(new Date('2021-01-01T00:00:00.500Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:00.500Z'),
                    },
                }),
            ).toBe(1000);

            // after
            vi.setSystemTime(new Date('2021-01-01T00:00:01.000Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:00.500Z'),
                    },
                }),
            ).toBe(1000);
        });

        it('should return correct value for time ramping decreasing', () => {
            // start
            vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(1000);

            // during
            vi.setSystemTime(new Date('2021-01-01T00:00:02Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(900);

            // end
            vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(500);

            // after
            vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'time',
                        endTime: new Date('2021-01-01T00:00:10Z'),
                    },
                }),
            ).toBe(500);
        });
    });

    describe('limit ramping', () => {
        it('should return correct value for limit ramping', () => {
            // start
            vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(500);

            // during
            vi.setSystemTime(new Date('2021-01-01T00:00:02Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(700);

            // end
            vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(1000);

            // after
            vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(1000);
        });

        it('should return correct value for limit ramping that exceeds toValue', () => {
            // start
            vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 2000,
                    },
                }),
            ).toBe(500);

            // during
            vi.setSystemTime(new Date('2021-01-01T00:00:02Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 2000,
                    },
                }),
            ).toBe(1000);

            // end
            vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 2000,
                    },
                }),
            ).toBe(1000);

            // after
            vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
            expect(
                calculateRampedValue({
                    lastValue: 500,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 1000,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 2000,
                    },
                }),
            ).toBe(1000);
        });

        it('should return correct value for limit ramping decreasing', () => {
            // start
            vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(1000);

            // during
            vi.setSystemTime(new Date('2021-01-01T00:00:02Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(800);

            // end
            vi.setSystemTime(new Date('2021-01-01T00:00:10Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(500);

            // after
            vi.setSystemTime(new Date('2021-01-01T00:00:15Z'));
            expect(
                calculateRampedValue({
                    lastValue: 1000,
                    lastValueTime: new Date('2021-01-01T00:00:00Z'),
                    toValue: 500,
                    ramping: {
                        type: 'limit',
                        maxChangePerSecond: 100,
                    },
                }),
            ).toBe(500);
        });
    });
});
