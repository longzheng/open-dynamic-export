import Decimal from 'decimal.js';

// The default ramp-rate of 0.27% per second (approximately equal to 16.67% per minute)
// which is the default value for Wgra in AS/NZS 4777.2
const defaultRampRatePercentPerSecond = 0.27;

type RampRate =
    | { type: 'limited'; percentPerSecond: number }
    | { type: 'noLimit' };

// many SunSpec inverters (including Fronius and SMA) does not properly support setting WGra using SunSpec
// the CSIP-AUS ramp rate requirement cannot be met without WGra
// this is a software based implementation of ramp rates to gradually apply changes to power output
export class RampRateHelper {
    private rampRate: RampRate = {
        type: 'limited',
        percentPerSecond: defaultRampRatePercentPerSecond,
    };
    private lastRampTime: Date | null = null;

    // returns the setGradW value for DERSettings
    // value is represented in hundredths of a precent
    // e.g. 27 = 0.27% per second
    getDerSettingsSetGradW(): number {
        switch (this.rampRate.type) {
            case 'limited': {
                return Math.round(this.rampRate.percentPerSecond * 100);
            }
            case 'noLimit': {
                return 0;
            }
        }
    }

    // value is represented in hundredths of a precent
    // e.g. 27 = 0.27% per second
    setRampRate(setGradW: number | null) {
        if (setGradW === null) {
            this.rampRate = {
                type: 'limited',
                percentPerSecond: defaultRampRatePercentPerSecond,
            };
            return;
        }

        if (setGradW === 0) {
            this.rampRate = { type: 'noLimit' };
            return;
        }

        this.rampRate = {
            type: 'limited',
            percentPerSecond: new Decimal(setGradW).div(100).toNumber(),
        };
    }

    // calculate the new power ratio when changing from current to target
    // because the ramp rate and power ratio are both expressed in % of rated power
    // we can simply use the ramp rate as a cap of the change
    // our update cycle is variable and does not follow a fixed time interval
    // so we must dynaically calculate the ramp value based on the time since the last update
    calculateRampValue({
        currentPowerRatio,
        targetPowerRatio,
    }: {
        currentPowerRatio: number;
        targetPowerRatio: number;
    }): number {
        switch (this.rampRate.type) {
            case 'limited': {
                // if we've reached the target, reset the ramping time
                if (currentPowerRatio === targetPowerRatio) {
                    this.lastRampTime = null;
                    return targetPowerRatio;
                }

                const now = new Date();

                // start ramping (nothing happens on this cycle, return current value)
                if (this.lastRampTime === null) {
                    this.lastRampTime = now;
                    return currentPowerRatio;
                }

                const secondsSinceStartOfRamp =
                    (now.getTime() - this.lastRampTime.getTime()) / 1000;

                // ramping values sub-second does not usually work because the changes are too small for the inverter to apply (usually 2 decimal points)
                // skip the cycle if it's less than a second
                if (secondsSinceStartOfRamp < 1) {
                    return currentPowerRatio;
                }

                const timeFactoredRampRate = new Decimal(
                    this.rampRate.percentPerSecond,
                )
                    .div(100)
                    .mul(secondsSinceStartOfRamp)
                    .toNumber();

                const diff = new Decimal(targetPowerRatio)
                    .sub(currentPowerRatio)
                    .toNumber();

                const diffAbs = Math.abs(diff);
                const diffSign = Math.sign(diff);

                const cappedDiff =
                    Math.min(diffAbs, timeFactoredRampRate) * diffSign;

                // update the ramp time for the next cycle
                this.lastRampTime = now;

                return new Decimal(currentPowerRatio)
                    .plus(cappedDiff)
                    .toNumber();
            }
            case 'noLimit': {
                this.lastRampTime = null;
                return targetPowerRatio;
            }
        }
    }
}
