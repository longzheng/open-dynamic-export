import { Decimal } from 'decimal.js';
import type { Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';

// The ramp-rate derived from 16.67% per minute (roughly 0.28% per second)
// which is the default value for Wgra in AS/NZS 4777.2.
//
// CSIP-AUS table 5.2.5.1 note 2: when ramping to a DefaultDERControl and no
// setGradW is set, the client shall ramp at this Wgra rate.
export const wgra4777PercentPerSecond = new Decimal(16.67).div(60).toNumber();

type RampRate =
    // ramping by a % of maximum power output per second
    | { type: 'limited'; percentPerSecond: number }
    // setGradW of 0, which SEP2 defines as no limit
    | { type: 'noLimit' }
    // no setGradW received, so the CSIP-AUS fallbacks apply. this is distinct
    // from a setGradW of 0: the fallback depends on what is being ramped to.
    | { type: 'unset' };

// many SunSpec inverters does not properly support setting WGra using SunSpec
// the CSIP-AUS ramp rate requirement cannot be met without WGra
// this is a software based implementation of ramp rates to gradually apply changes to limits
export class RampRateHelper {
    private defaultDerControlRampRate: RampRate = { type: 'unset' };
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
            case 'unset': {
                // report the Wgra rate we would actually fall back to when
                // ramping to a DefaultDERControl
                return Math.round(wgra4777PercentPerSecond * 100);
            }
        }
    }

    // whether the utility server has set a setGradW. the CSIP-AUS fallback for
    // ramping to a DERControl differs from the fallback for a DefaultDERControl,
    // so the caller needs to know the difference.
    hasSetGradW(): boolean {
        return this.defaultDerControlRampRate.type !== 'unset';
    }

    // setGradW is represented in hundredths of a percent
    // e.g. 27 = 0.27% per second
    setDefaultDERControlRampRate(setGradW: number | null) {
        this.logger.debug({ setGradW }, 'Updated default DERControl Ramp Rate');

        if (setGradW === null) {
            this.defaultDerControlRampRate = { type: 'unset' };
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
        const percentPerSecond = ((): number | null => {
            switch (this.defaultDerControlRampRate.type) {
                case 'limited':
                    return this.defaultDerControlRampRate.percentPerSecond;
                case 'noLimit':
                    return null;
                case 'unset':
                    // CSIP-AUS table 5.2.5.1 note 2: with no setGradW set, ramp
                    // at the AS/NZS 4777.2 Wgra rate. Ramping to a DERControl
                    // instead uses a 15 second soft-start, which the caller
                    // applies as an explicit ramp time rather than a rate.
                    return wgra4777PercentPerSecond;
            }
        })();

        if (percentPerSecond === null || !this.totalNameplateWatts) {
            return { type: 'noLimit' };
        }

        return {
            type: 'limited',
            wattsPerSecond: this.totalNameplateWatts * (percentPerSecond / 100),
        };
    }
}
