import type { InverterControlLimit } from './inverterController.js';

export type LimiterType = {
    getInverterControlLimit(): InverterControlLimit;
};
