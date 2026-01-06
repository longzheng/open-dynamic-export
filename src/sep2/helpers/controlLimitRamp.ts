import { cappedChange } from '../../helpers/math.js';
import { type RampRateHelper } from './rampRate.js';

export type ControlLimitRampTarget =
    | {
          type: 'active' | 'default';
          value: number | undefined;
          rampTimeSeconds: number | undefined;
      }
    | { type: 'none'; value: number | undefined };

export class ControlLimitRampHelper {
    private rampRateHelper: RampRateHelper;
    private cachedValue:
        | {
              type: 'active' | 'default';
              value: number;
              time: Date;
              isRamping: boolean;
          }
        | { type: 'none'; value: number | undefined } = {
        type: 'none',
        value: undefined,
    };
    private target:
        | {
              type: 'active' | 'default';
              value: number;
              endDateTime: Date | null;
          }
        | { type: 'none'; value: number | undefined } = {
        type: 'none',
        value: undefined,
    };

    constructor({ rampRateHelper }: { rampRateHelper: RampRateHelper }) {
        this.rampRateHelper = rampRateHelper;
    }

    public updateTarget(target: ControlLimitRampTarget) {
        switch (target.type) {
            case 'none':
                this.target = { type: 'none', value: target.value };
                return;
            case 'active':
            case 'default': {
                if (target.value === undefined) {
                    this.target = { type: 'none', value: target.value };
                    return;
                }

                if (
                    this.target.type !== 'none' &&
                    target.value === this.target.value
                ) {
                    return;
                }

                this.target = {
                    type: target.type,
                    value: target.value,
                    endDateTime: target.rampTimeSeconds
                        ? new Date(
                              new Date().getTime() +
                                  target.rampTimeSeconds * 1000,
                          )
                        : null,
                };
            }
        }
    }

    public getRampedValue(): number | undefined {
        const value = ((): number | undefined => {
            switch (this.target.type) {
                case 'none':
                    return this.target.value;
                case 'active':
                case 'default': {
                    switch (this.cachedValue.type) {
                        case 'none':
                            return this.target.value;
                        case 'active':
                        case 'default': {
                            // skip ramping if going from active to active control
                            // and not already ramping (due to a previous default target)
                            // and the target does not have a specified end date
                            if (
                                this.cachedValue.type === 'active' &&
                                this.target.type === 'active' &&
                                this.target.endDateTime === null &&
                                !this.cachedValue.isRamping
                            ) {
                                // No ramping needed, return target value immediately
                                return this.target.value;
                            }

                            const ramping: Ramping = (() => {
                                if (this.target.endDateTime) {
                                    return {
                                        type: 'time',
                                        endTime: this.target.endDateTime,
                                    };
                                }

                                const maxChangeWatts =
                                    this.rampRateHelper.getMaxChangeWatts();

                                switch (maxChangeWatts.type) {
                                    case 'limited': {
                                        return {
                                            type: 'limit',
                                            maxChangePerSecond:
                                                maxChangeWatts.wattsPerSecond,
                                        };
                                    }
                                    case 'noLimit': {
                                        return { type: 'noLimit' };
                                    }
                                }
                            })();

                            // Ramping is needed
                            return calculateRampedValue({
                                lastValue: this.cachedValue.value,
                                lastValueTime: this.cachedValue.time,
                                toValue: this.target.value,
                                ramping,
                            });
                        }
                    }
                }
            }
        })();

        this.cachedValue = (() => {
            if (value === undefined || this.target.type === 'none') {
                return { type: 'none', value: this.target.value };
            }

            const hasReachedTarget = value === this.target.value;

            return {
                type: this.target.type,
                value,
                time: new Date(),
                isRamping: !hasReachedTarget,
            };
        })();

        return value;
    }
}

type Ramping =
    | {
          type: 'time';
          endTime: Date;
      }
    | {
          type: 'limit';
          maxChangePerSecond: number;
      }
    | {
          type: 'noLimit';
      };

export function calculateRampedValue({
    lastValue,
    lastValueTime,
    toValue,
    ramping,
}: {
    lastValue: number;
    lastValueTime: Date;
    toValue: number;
    ramping: Ramping;
}) {
    if (toValue === lastValue || ramping.type === 'noLimit') {
        return toValue;
    }

    const lastValueTimestamp = new Date(lastValueTime).getTime();
    const nowTimestamp = new Date().getTime();

    const secondsSinceLastValue = (nowTimestamp - lastValueTimestamp) / 1000;

    if (secondsSinceLastValue < 0) {
        throw new Error('lastValueTime is in the future');
    }

    switch (ramping.type) {
        case 'time': {
            const endTimestamp = ramping.endTime.getTime();

            if (nowTimestamp >= endTimestamp) {
                return toValue;
            }

            const delta = toValue - lastValue;
            const rateOfChangePerSecond =
                delta / ((endTimestamp - lastValueTimestamp) / 1000);
            const changeSinceLastValue =
                rateOfChangePerSecond * secondsSinceLastValue;

            return lastValue + changeSinceLastValue;
        }
        case 'limit': {
            const maxChange =
                ramping.maxChangePerSecond * secondsSinceLastValue;

            return cappedChange({
                previousValue: lastValue,
                targetValue: toValue,
                maxChange,
            });
        }
    }
}
