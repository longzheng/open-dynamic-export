import { Decimal } from 'decimal.js';
import { cappedChange } from '../../helpers/math.js';
import type { RampRateHelper } from './rampRate.js';

export type ControlLimitRampTarget =
    | {
          type: 'active' | 'default';
          value: number | undefined;
          rampTimeSeconds: number | undefined;
      }
    | { type: 'none'; value: number | undefined };

// CSIP-AUS table 5.2.5.1 note 1: when ramping to a DERControl with neither a
// rampTms on the control nor a setGradW set, the client should meet the control
// within 15 seconds, as described in AS/NZS 4777.2 (soft-start). Note 2 covers
// ramping to a DefaultDERControl instead, which falls back to the Wgra rate.
const softStartRampSeconds = 15;

// DERControlBase.rampTms is expressed in hundredths of a second (resolution
// 1/100 sec) but this helper works in seconds, so it must be scaled down.
// e.g. rampTms 6000 = 60 seconds
export function rampTmsToSeconds(
    rampTms: number | undefined,
): number | undefined {
    if (rampTms === undefined) {
        return undefined;
    }

    return new Decimal(rampTms).div(100).toNumber();
}

export class ControlLimitRampHelper {
    private rampRateHelper: RampRateHelper;
    private cachedValue:
        | {
              type: 'active' | 'default';
              value: number;
              time: Date;
          }
        | { type: 'none'; value: number | undefined } = {
        type: 'none',
        value: undefined,
    };
    private target:
        | {
              type: 'active' | 'default';
              value: number;
              // retained so an unchanged target can be recognised without
              // re-arming endDateTime on every poll
              rampTimeSeconds: number | undefined;
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

                // ramping to a DERControl with no rampTms and no setGradW must
                // meet the control within 15 seconds, so apply the soft-start
                // as an explicit ramp time. ramping to a DefaultDERControl has
                // no such deadline and falls through to the Wgra rate below.
                const rampTimeSeconds =
                    target.rampTimeSeconds ??
                    (target.type === 'active' &&
                    !this.rampRateHelper.hasSetGradW()
                        ? softStartRampSeconds
                        : undefined);

                // the same target arrives on every poll, so ignore it unless
                // something actually changed. comparing the type and ramp time
                // as well as the value means a control that changes only its
                // rampTms, or only from active to default, is still applied.
                if (
                    this.target.type !== 'none' &&
                    target.value === this.target.value &&
                    target.type === this.target.type &&
                    rampTimeSeconds === this.target.rampTimeSeconds
                ) {
                    return;
                }

                this.target = {
                    type: target.type,
                    value: target.value,
                    rampTimeSeconds,
                    endDateTime: rampTimeSeconds
                        ? new Date(
                              new Date().getTime() + rampTimeSeconds * 1000,
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
                            // every transition ramps. what differs is the rate,
                            // which depends only on what is being ramped to:
                            // an explicit rampTms or the 15s soft-start give an
                            // endDateTime, otherwise setGradW (or the Wgra
                            // fallback) applies as a rate. the previous control
                            // does not affect the choice.
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

            return {
                type: this.target.type,
                value,
                time: new Date(),
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
