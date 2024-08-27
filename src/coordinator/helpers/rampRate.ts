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
    // setGradW is represented in hundredths of a percent
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

    // setGradW is represented in hundredths of a percent
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

                // start ramping
                // reeturn the current value and wait until a future cycle
                if (this.lastRampTime === null) {
                    this.lastRampTime = now;
                    return currentPowerRatio;
                }

                const secondsSinceStartOfRamp =
                    (now.getTime() - this.lastRampTime.getTime()) / 1000;

                const timeFactoredRampRatio = new Decimal(
                    this.rampRate.percentPerSecond,
                )
                    .div(100) // ramp rate is expressed in %, convert to ratio
                    .mul(secondsSinceStartOfRamp)
                    .toNumber();

                const diff = new Decimal(targetPowerRatio)
                    .sub(currentPowerRatio)
                    .toNumber();

                const diffAbs = Math.abs(diff);

                const diffSign = Math.sign(diff);

                const cappedDiff = Math.min(diffAbs, timeFactoredRampRatio);

                // power ratio values are only applicable in SunSpec to 2 decimal points (0.01%)
                // if the difference is too small, return the current value and wait until a future cycle (with more time)
                if (cappedDiff < 0.0001) {
                    return currentPowerRatio;
                }

                // update the ramp time for the next cycle
                this.lastRampTime = now;

                return new Decimal(currentPowerRatio)
                    .plus(cappedDiff * diffSign)
                    .toNumber();
            }
            case 'noLimit': {
                this.lastRampTime = null;
                return targetPowerRatio;
            }
        }
    }
}
