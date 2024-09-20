import type { RampRateHelper } from './rampRate.js';

export class ControlLimitRampHelper {
    private rampRateHelper: RampRateHelper;
    private cachedValue:
        | {
              value: number;
              time: Date;
          }
        | undefined = undefined;
    private target: {
        value: number;
        endDateTime: Date | null;
    } | null = null;

    constructor({ rampRateHelper }: { rampRateHelper: RampRateHelper }) {
        this.rampRateHelper = rampRateHelper;
    }

    public updateTarget({
        value,
        rampTimeSeconds,
    }: {
        value: number | undefined;
        rampTimeSeconds: number | undefined;
    }) {
        if (value === undefined) {
            // if there is no target value
            // we want to fallback to the total nameplate watts
            // this is so that we can smoothly ramp between no limit and a limit
            // this only applies to export/generation limits so total nameplate watts should be reasonable
            const totalNameplateWatts =
                this.rampRateHelper.getTotalNameplateWatts;

            this.target = totalNameplateWatts
                ? { value: totalNameplateWatts, endDateTime: null }
                : null;
            return;
        }

        if (value === this.target?.value) {
            return;
        }

        this.target = {
            value,
            endDateTime: rampTimeSeconds
                ? new Date(new Date().getTime() + rampTimeSeconds * 1000)
                : null,
        };
    }

    public getRampedValue(): number | undefined {
        const value = ((): number | undefined => {
            if (!this.target) {
                return undefined;
            }

            if (this.cachedValue === undefined) {
                return this.target.value;
            }

            const ramping: Ramping = (() => {
                if (this.target.endDateTime) {
                    return {
                        type: 'time',
                        endTime: this.target.endDateTime,
                    };
                }

                const maxChangeWatts = this.rampRateHelper.getMaxChangeWatts();

                switch (maxChangeWatts.type) {
                    case 'limited': {
                        return {
                            type: 'limit',
                            maxChangePerSecond: maxChangeWatts.wattsPerSecond,
                        };
                    }
                    case 'noLimit': {
                        return { type: 'noLimit' };
                    }
                }
            })();

            return calculateRampedValue({
                lastValue: this.cachedValue.value,
                lastValueTime: this.cachedValue.time,
                toValue: this.target.value,
                ramping,
            });
        })();

        this.cachedValue =
            value !== undefined
                ? {
                      value,
                      time: new Date(),
                  }
                : undefined;

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
            const delta = toValue - lastValue;
            const direction = Math.sign(delta);

            // If delta is zero, no change is needed
            if (direction === 0) {
                return toValue;
            }

            const limitedChange =
                direction *
                Math.min(
                    Math.abs(delta),
                    ramping.maxChangePerSecond * secondsSinceLastValue,
                );

            return lastValue + limitedChange;
        }
    }
}
