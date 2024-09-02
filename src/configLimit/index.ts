import type { InverterControlLimit } from '../coordinator/helpers/inverterController';
import type { InverterControlLimitType } from '../coordinator/helpers/inverterControlLimitType';
import type { Config } from '../helpers/config';

export class ConfigControlLimit implements InverterControlLimitType {
    private config: Config;

    constructor({ config }: { config: Config }) {
        this.config = config;
    }

    getInverterControlLimit(): InverterControlLimit {
        return {
            opModConnect: this.config.limit?.connect,
            opModEnergize: this.config.limit?.connect,
            opModExpLimW: this.config.limit?.exportLimitWatts,
            opModGenLimW: this.config.limit?.generationLimitWatts,
        };
    }
}
