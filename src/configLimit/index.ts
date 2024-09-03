import type { InverterControlLimit } from '../coordinator/helpers/inverterController';
import type { InverterControlLimitType } from '../coordinator/helpers/inverterControlLimitType';
import type { Config } from '../helpers/config';

export class ConfigControlLimit implements InverterControlLimitType {
    private config: NonNullable<Config['limit']>;

    constructor({ config }: { config: NonNullable<Config['limit']> }) {
        this.config = config;
    }

    getInverterControlLimit(): InverterControlLimit {
        return {
            opModConnect: this.config.connect,
            opModEnergize: this.config.connect,
            opModExpLimW: this.config.exportLimitWatts,
            opModGenLimW: this.config.generationLimitWatts,
        };
    }
}
