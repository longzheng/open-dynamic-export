import { type InverterControlLimit } from '../coordinator/helpers/inverterController.js';

export type LimiterType = {
    getInverterControlLimit(): InverterControlLimit;
    destroy(): void;
};
