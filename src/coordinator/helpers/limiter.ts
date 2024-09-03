import type { InverterControlLimit } from './inverterController';

export type LimiterType = {
    getInverterControlLimit(): InverterControlLimit;
};
