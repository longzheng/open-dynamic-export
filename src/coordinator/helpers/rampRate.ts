import Decimal from 'decimal.js';
import { logger as pinoLogger } from '../../helpers/logger';
import type { Logger } from 'pino';

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
    private defaultDerControlRampRate: RampRate = {
        type: 'limited',
        percentPerSecond: defaultRampRatePercentPerSecond,
    };
    private rampConfig:
        | RampRate
        | { type: 'controlRampTms'; seconds: number; startRampTime: Date } =
        this.defaultDerControlRampRate;
    private lastRampTime: Date | null = null;
    private logger: Logger;

    constructor() {
        this.logger = pinoLogger.child({ module: 'RampRateHelper' });
    }

    // returns the setGradW value for DERSettings
    // setGradW is represented in hundredths of a percent
    // e.g. 27 = 0.27% per second
    getDerSettingsSetGradW(): number {
        switch (this.defaultDerControlRampRate.type) {
            case 'limited': {
                return Math.round(
                    this.defaultDerControlRampRate.percentPerSecond * 100,
                );
            }
            case 'noLimit': {
                return 0;
            }
        }
    }

    // setGradW is represented in hundredths of a percent
    // e.g. 27 = 0.27% per second
    setDefaultDERControlRampRate(setGradW: number | null) {
        this.logger.debug({ setGradW }, 'Updated default DERControl Ramp Rate');

        if (setGradW === null) {
            this.defaultDerControlRampRate = {
                type: 'limited',
                percentPerSecond: defaultRampRatePercentPerSecond,
            };
        } else if (setGradW === 0) {
            this.defaultDerControlRampRate = { type: 'noLimit' };
        } else {
            this.defaultDerControlRampRate = {
                type: 'limited',
                percentPerSecond: new Decimal(setGradW).div(100).toNumber(),
            };
        }

        if (this.rampConfig.type !== 'controlRampTms') {
            this.revertToDefaultRampConfig();
        }
    }

    // start ramping using a DERControl RampTms value
    startControlRampTms(rampTms: number) {
        this.logger.debug({ rampTms }, 'Setting ramp rate to controlRampTms');

        this.rampConfig = {
            type: 'controlRampTms',
            // rampTms is in hundredths of a second
            seconds: rampTms / 100,
            startRampTime: new Date(),
        };
        this.lastRampTime = null;
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
        switch (this.rampConfig.type) {
            case 'controlRampTms': {
                // if we've reached the target, reset to default ramping
                if (currentPowerRatio === targetPowerRatio) {
                    this.revertToDefaultRampConfig();
                    return targetPowerRatio;
                }

                const now = new Date();

                // start ramping
                // reeturn the current value and wait until a future cycle
                if (this.lastRampTime === null) {
                    this.lastRampTime = now;
                    return currentPowerRatio;
                }

                const secondsSinceLastRamp =
                    (now.getTime() - this.lastRampTime.getTime()) / 1000;

                const secondsSinceStartOfRamp =
                    (now.getTime() - this.rampConfig.startRampTime.getTime()) /
                    1000;

                if (secondsSinceStartOfRamp >= this.rampConfig.seconds) {
                    this.revertToDefaultRampConfig();
                    return targetPowerRatio;
                }

                const delta = new Decimal(targetPowerRatio)
                    .sub(currentPowerRatio)
                    .toNumber();

                const deltaAbs = Math.abs(delta);

                const deltaSign = Math.sign(delta);

                const rampRate = new Decimal(deltaAbs)
                    .div(this.rampConfig.seconds - secondsSinceStartOfRamp)
                    .toNumber();

                const timeFactoredRampRatio = new Decimal(rampRate)
                    .mul(secondsSinceLastRamp)
                    .toNumber();

                const cappedDelta = Math.min(deltaAbs, timeFactoredRampRatio);

                // power ratio values are only applicable in SunSpec to 2 decimal points (0.01%)
                // if the difference is too small, return the current value and wait until a future cycle (with more time)
                if (cappedDelta < 0.0001) {
                    return currentPowerRatio;
                }

                // update the ramp time for the next cycle
                this.lastRampTime = now;

                return new Decimal(currentPowerRatio)
                    .plus(cappedDelta * deltaSign)
                    .toNumber();
            }
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

                const secondsSinceLastRamp =
                    (now.getTime() - this.lastRampTime.getTime()) / 1000;

                const timeFactoredRampRatio = new Decimal(
                    this.rampConfig.percentPerSecond,
                )
                    .div(100) // ramp rate is expressed in %, convert to ratio
                    .mul(secondsSinceLastRamp)
                    .toNumber();

                const delta = new Decimal(targetPowerRatio)
                    .sub(currentPowerRatio)
                    .toNumber();

                const deltaAbs = Math.abs(delta);

                const deltaSign = Math.sign(delta);

                const cappedDelta = Math.min(deltaAbs, timeFactoredRampRatio);

                // power ratio values are only applicable in SunSpec to 2 decimal points (0.01%)
                // if the delta is too small, return the current value and wait until a future cycle (with more time)
                if (cappedDelta < 0.0001) {
                    return currentPowerRatio;
                }

                // update the ramp time for the next cycle
                this.lastRampTime = now;

                return new Decimal(currentPowerRatio)
                    .plus(cappedDelta * deltaSign)
                    .toNumber();
            }
            case 'noLimit': {
                this.lastRampTime = null;

                return targetPowerRatio;
            }
        }
    }

    private revertToDefaultRampConfig() {
        this.rampConfig = this.defaultDerControlRampRate;
        this.lastRampTime = null;
    }
}
