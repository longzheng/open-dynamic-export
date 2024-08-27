import Decimal from 'decimal.js';

// The default ramp-rate of 0.27% per second is approximately equal to 16.67% per minute, which is
// the default value for Wgra in AS/NZS 4777.2
const defaultRampRatePercentPerSecond = 0.27;

export type RampRate =
    | { type: 'limited'; percentPerSecond: number }
    | { type: 'noLimit' };

// many SunSpec inverters (including Fronius and SMA) does not properly support setting WGra
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

    calculateRampValue({
        current,
        target,
    }: {
        current: number;
        target: number;
    }): number {
        switch (this.rampRate.type) {
            case 'limited': {
                // if we've reached the target, reset the last action time
                if (current === target) {
                    this.lastRampTime = null;
                    return target;
                }

                // start ramping
                if (this.lastRampTime === null) {
                    this.lastRampTime = new Date();
                }

                const secondsSinceStartOfRamp =
                    (new Date().getTime() - this.lastRampTime.getTime()) / 1000;

                const currentRampRatePercent = Math.min(
                    1,
                    new Decimal(this.rampRate.percentPerSecond)
                        .div(100)
                        .mul(secondsSinceStartOfRamp)
                        .toNumber(),
                );

                const diff = new Decimal(target).sub(current);

                const change = diff.mul(currentRampRatePercent);

                return new Decimal(current).plus(change).toNumber();
            }
            case 'noLimit': {
                return target;
            }
        }
    }
}
