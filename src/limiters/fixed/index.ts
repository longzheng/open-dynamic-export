import type { InverterControlLimit } from '../../coordinator/helpers/inverterController.js';
import type { LimiterType } from '../limiter.js';
import type { Config } from '../../helpers/config.js';
import { writeControlLimit } from '../../helpers/influxdb.js';

type FixedLimiterConfig = NonNullable<Config['limiters']['fixed']>;

export class FixedLimiter implements LimiterType {
    private config: FixedLimiterConfig;

    constructor({ config }: { config: FixedLimiterConfig }) {
        this.config = config;
    }

    getInverterControlLimit(): InverterControlLimit {
        const limit = {
            opModConnect: this.config.connect,
            opModEnergize: this.config.connect,
            opModExpLimW: this.config.exportLimitWatts,
            opModGenLimW: this.config.generationLimitWatts,
        };

        writeControlLimit({ limit, name: 'fixed' });

        return limit;
    }
}
