import type { InverterControlLimit } from './inverterController';

export abstract class InverterControlLimitBase {
    abstract getInverterControlLimit(): InverterControlLimit;
}
