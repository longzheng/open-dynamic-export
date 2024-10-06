import { Decimal } from 'decimal.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { Logger } from 'pino';
import type { DerSample } from '../../coordinator/helpers/derSample.js';

// The default ramp-rate derived from 16.67% per minute (roughly 0.28% per second)
// which is the default value for Wgra in AS/NZS 4777.2
export const defaultRampRatePercentPerSecond = new Decimal(16.67)
    .div(60)
    .toNumber();

type RampRate =
    // ramping by a % of maximum power output per second
    | { type: 'limited'; percentPerSecond: number }
    // no ramping
    | { type: 'noLimit' };

// many SunSpec inverters does not properly support setting WGra using SunSpec
// the CSIP-AUS ramp rate requirement cannot be met without WGra
// this is a software based implementation of ramp rates to gradually apply changes to limits
export class RampRateHelper {
    private defaultDerControlRampRate: RampRate = {
        type: 'limited',
        percentPerSecond: defaultRampRatePercentPerSecond,
    };
    private totalNameplateWatts: number | null = null;
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
    }

    public onDerSample(derSample: {
        nameplate: Pick<DerSample['nameplate'], 'maxW'>;
    }) {
        this.totalNameplateWatts = derSample.nameplate.maxW;
    }

    public getMaxChangeWatts():
        | { type: 'limited'; wattsPerSecond: number }
        | { type: 'noLimit' } {
        switch (this.defaultDerControlRampRate.type) {
            case 'limited': {
                if (!this.totalNameplateWatts) {
                    return { type: 'noLimit' };
                }

                return {
                    type: 'limited',
                    wattsPerSecond:
                        this.totalNameplateWatts *
                        (this.defaultDerControlRampRate.percentPerSecond / 100),
                };
            }
            case 'noLimit': {
                return {
                    type: 'noLimit',
                };
            }
        }
    }
}
