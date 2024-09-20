import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ControlLimitRampHelper } from './controlLimitRamp.js';
import { calculateRampedValue } from './controlLimitRamp.js';
import { RampRateHelper } from './rampRate.js';
import { addSeconds } from 'date-fns';

afterEach(() => {
    vi.getRealSystemTime();
});

describe('ControlLimitRampHelper', () => {
    let rampRateHelper: RampRateHelper;
    let helper: ControlLimitRampHelper;

    beforeEach(() => {
        rampRateHelper = new RampRateHelper();
        helper = new ControlLimitRampHelper({ rampRateHelper });
    });

    it('should return no value for no target and no total nameplate', () => {
        helper.updateTarget({ value: undefined, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(undefined);

        expect(helper.getRampedValue()).toBe(undefined);
    });

    it('should return nameplate value for no target with total nameplate', () => {
        rampRateHelper.onInverterData([
            {
                nameplate: { maxW: 10000 },
            },
        ]);
        helper.updateTarget({ value: undefined, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(10000);

        expect(helper.getRampedValue()).toBe(10000);
    });

    it('should return target value immediately if first time ramping', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));

        rampRateHelper.onInverterData([
            {
                nameplate: { maxW: 10000 },
            },
        ]);
        helper.updateTarget({ value: 5000, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        expect(helper.getRampedValue()).toBe(5000);
    });

    it('should return ramped value with 1% ramp rate', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onInverterData([
            {
                nameplate: { maxW: 10000 },
            },
        ]);
        helper.updateTarget({ value: 5000, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({ value: 1500, rampTimeSeconds: undefined });

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

    it('should return ramped value with timed ramping', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));

        rampRateHelper.onInverterData([
            {
                nameplate: { maxW: 10000 },
            },
        ]);
        helper.updateTarget({ value: 5000, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({ value: 1500, rampTimeSeconds: 5 });

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
    });

    it('should allow ramping to change while still ramping', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(100);
        rampRateHelper.onInverterData([
            {
                nameplate: { maxW: 10000 },
            },
        ]);
        helper.updateTarget({ value: 5000, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({ value: 1500, rampTimeSeconds: undefined });

        expect(helper.getRampedValue()).toBe(5000);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:00:30Z'));
        const rampedValue1 = helper.getRampedValue();
        expect(rampedValue1).toBe(5000 - 10000 * (1 / 100) * 30);

        // new target
        helper.updateTarget({ value: 10000, rampTimeSeconds: undefined });
        expect(helper.getRampedValue()).toBe(rampedValue1);

        // after 30 seconds
        vi.setSystemTime(new Date('2021-01-01T01:01:00Z'));
        const rampedValue2 = helper.getRampedValue();
        expect(rampedValue2).toBe(rampedValue1! + 10000 * (1 / 100) * 30);
    });

    it('should return ramped value with no limit ramp rate', () => {
        vi.setSystemTime(new Date('2021-01-01T00:00:00Z'));
        rampRateHelper.setDefaultDERControlRampRate(0);
        rampRateHelper.onInverterData([
            {
                nameplate: { maxW: 10000 },
            },
        ]);
        helper.updateTarget({ value: 5000, rampTimeSeconds: undefined });

        // cache initial value
        expect(helper.getRampedValue()).toBe(5000);

        // new target (new hour)
        vi.setSystemTime(new Date('2021-01-01T01:00:00Z'));

        expect(helper.getRampedValue()).toBe(5000);

        helper.updateTarget({ value: 1500, rampTimeSeconds: undefined });

        expect(helper.getRampedValue()).toBe(1500);
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
