import type { ActiveDERControlBaseValues } from './inverterController';

export abstract class ControlSystemBase {
    abstract getActiveDerControlBaseValues(): ActiveDERControlBaseValues;
}
