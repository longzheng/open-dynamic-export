import { type InverterControlLimit } from '../coordinator/helpers/inverterController.js';

export type SetpointType = {
    getInverterControlLimit(): InverterControlLimit;
    destroy(): void;
};
