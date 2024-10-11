import type { Logger } from 'pino';
import type { SEP2Client } from '../client.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { DERControlBase } from '../models/derControlBase.js';
import type {
    DerControlsHelperChangedData,
    MergedControlsData,
} from './derControls.js';
import { DerControlResponseHelper } from './derControlResponse.js';
import {
    getDerControlEndDate,
    sortByProgramPrimacyAndEventCreationTime,
} from './derControl.js';
import { randomInt } from 'crypto';
import { addSeconds, isEqual, max } from 'date-fns';
import { writeControlSchedulerPoints } from '../../helpers/influxdb.js';
import type { DERControl } from '../models/derControl.js';
import type { FallbackControl } from './fallbackControl.js';
import { ResponseStatus } from '../models/responseStatus.js';

export type ControlType = Exclude<keyof DERControlBase, 'rampTms'>;

type DERControlBaseValueOfType<ControlKey extends ControlType> =
    | {
          type: 'active' | 'default';
          control: DERControlBase[ControlKey];
          rampTms: DERControlBase['rampTms'];
      }
    | { type: 'none'; control: undefined };

export type RandomizedControlSchedule = ControlSchedule & {
    effectiveStartInclusive: Date;
    effectiveEndExclusive: Date;
};

export type ControlSchedule = {
    // these values are lifted from the MergedControlsData for convenience
    startInclusive: Date;
    endExclusive: Date;
    randomizeStart: number | undefined;
    randomizeDuration: number | undefined;
    data: MergedControlsData;
};

export class ControlSchedulerHelper<ControlKey extends ControlType> {
    private client: SEP2Client;
    private derControlResponseHelper: DerControlResponseHelper;
    private logger: Logger;
    private controlType: ControlKey;
    private fallbackControl: FallbackControl = {
        type: 'none',
    };
    private controlSchedules: RandomizedControlSchedule[] = [];
    private activeControlSchedule: RandomizedControlSchedule | null = null;

    constructor({
        client,
        controlType,
    }: {
        client: SEP2Client;
        controlType: ControlKey;
    }) {
        this.client = client;
        this.controlType = controlType;
        this.derControlResponseHelper = new DerControlResponseHelper({
            client,
        });
        this.logger = pinoLogger.child({
            module: 'ControlSchedulerHelper',
            controlType,
        });
    }

    getControlSchedules() {
        return this.controlSchedules;
    }

    updateFallbackControl(fallbackControl: FallbackControl) {
        this.fallbackControl = fallbackControl;
    }

    updateControlsData({
        activeOrScheduledControls,
        fallbackControl,
    }: DerControlsHelperChangedData) {
        this.updateFallbackControl(fallbackControl);

        const controlsOfType = filterControlsOfType({
            activeOrScheduledControls,
            type: this.controlType,
        });

        const generatedControlSchedules = generateControlsSchedule({
            activeOrScheduledControlsOfType: controlsOfType,
            onSupersededControl: ({
                supersededControl,
                supersedingControl,
            }) => {
                this.logger.debug(
                    {
                        supersededControl,
                        supersedingControl,
                    },
                    'Control schedule superseded',
                );

                void this.derControlResponseHelper.respondDerControl({
                    derControl: supersededControl,
                    status: ResponseStatus.EventSuperseded,
                });
            },
        });

        this.controlSchedules = applyRandomizationToControlSchedule({
            activeControlSchedule: this.activeControlSchedule,
            controlSchedules: generatedControlSchedules,
        });

        this.logger.debug(
            { controlSchedules: this.controlSchedules },
            'Updated control schedules',
        );
    }

    public getActiveScheduleDerControlBaseValue(): DERControlBaseValueOfType<ControlKey> {
        // calculate the active control schedule from the schedule
        const newActiveControlSchedule = this.findActiveControlScheduleForNow();

        if (
            this.activeControlSchedule?.data.control.mRID !==
            newActiveControlSchedule?.data.control.mRID
        ) {
            void this.handleActiveControlScheduleChange(
                newActiveControlSchedule,
            );
        }

        return this.getCurrentControlBaseValue();
    }

    private async handleActiveControlScheduleChange(
        newActiveControlSchedule: RandomizedControlSchedule | null,
    ) {
        const now = new Date();

        // if the schedule should be changed
        if (this.activeControlSchedule) {
            const activeControlScheduleEnd =
                this.activeControlSchedule.effectiveEndExclusive;
            const activeControlScheduleEndedSuccessfully =
                activeControlScheduleEnd <= now;

            if (activeControlScheduleEndedSuccessfully) {
                this.logger.info(
                    {
                        activeControlSchedule: this.activeControlSchedule,
                        now,
                    },
                    'Active control schedule completed',
                );

                await this.derControlResponseHelper.respondDerControl({
                    derControl: this.activeControlSchedule.data.control,
                    status: ResponseStatus.EventCompleted,
                });
            } else {
                this.logger.warn(
                    {
                        activeControlSchedule: this.activeControlSchedule,
                        now,
                    },
                    'Active control schedule aborted before end time',
                );
            }

            // remove the active control schedule from the schedule list
            this.controlSchedules = this.controlSchedules.filter(
                (schedule) =>
                    schedule.data.control.mRID !==
                    this.activeControlSchedule?.data.control.mRID,
            );
        }

        if (newActiveControlSchedule) {
            this.logger.info(
                { newActiveControlSchedule, now },
                'Active control schedule started',
            );

            await this.derControlResponseHelper.respondDerControl({
                derControl: newActiveControlSchedule.data.control,
                status: ResponseStatus.EventStarted,
            });
        } else {
            this.logger.info(
                { defaultControl: this.fallbackControl, now },
                'Default control started',
            );
        }

        // set the new active control schedule
        this.activeControlSchedule = newActiveControlSchedule;
    }

    private getCurrentControlBaseValue(): DERControlBaseValueOfType<ControlKey> {
        writeControlSchedulerPoints({
            activeControlSchedule: this.activeControlSchedule,
            controlType: this.controlType,
            fallbackControl: this.fallbackControl,
        });

        if (this.activeControlSchedule) {
            const controlBase =
                this.activeControlSchedule.data.control.derControlBase;

            return {
                type: 'active',
                control: controlBase[this.controlType],
                rampTms: controlBase.rampTms,
            };
        }

        switch (this.fallbackControl.type) {
            case 'default': {
                const controlBase =
                    this.fallbackControl.data.defaultControl.derControlBase;
                return {
                    type: 'default',
                    control: controlBase[this.controlType],
                    rampTms: controlBase.rampTms,
                };
            }
            case 'none':
                return { type: 'none', control: undefined };
        }
    }

    private findActiveControlScheduleForNow(): RandomizedControlSchedule | null {
        const nowSchedules = this.controlSchedules.filter(
            (control) =>
                control.effectiveStartInclusive <= new Date() &&
                control.effectiveEndExclusive > new Date(),
        );

        if (nowSchedules.length === 0) {
            return null;
        }

        if (nowSchedules.length > 1) {
            throw new Error('Multiple schedules found');
        }

        return nowSchedules[0]!;
    }
}

export function filterControlsOfType<
    T extends {
        control: Pick<MergedControlsData['control'], 'derControlBase'>;
    },
>({
    activeOrScheduledControls,
    type,
}: {
    activeOrScheduledControls: T[];
    type: ControlType;
}) {
    return activeOrScheduledControls.filter(
        ({ control }) =>
            Object.keys(control.derControlBase).includes(type) &&
            control.derControlBase[type] !== undefined,
    );
}

export function generateControlsSchedule({
    activeOrScheduledControlsOfType,
    onSupersededControl,
}: {
    // assume only active or scheduled controls
    activeOrScheduledControlsOfType: MergedControlsData[];
    onSupersededControl?: (controls: {
        supersededControl: DERControl;
        supersedingControl: DERControl;
    }) => void;
}): ControlSchedule[] {
    const sortedDatetimes = getSortedUniqueDatetimesFromControls(
        activeOrScheduledControlsOfType,
    );
    const chunkedControlsScheduleByPriority =
        buildChunkedControlsScheduleByPriority({
            activeOrScheduledControls: activeOrScheduledControlsOfType,
            sortedDatetimes,
            onSupersededControl,
        });

    const joinedControlsSchedules = joinChunkedControlSchedules({
        chunkedSchedules: chunkedControlsScheduleByPriority,
    });

    return joinedControlsSchedules;
}

// get all unique start and end datetimes from a list of controls
export function getSortedUniqueDatetimesFromControls<
    T extends {
        control: Pick<MergedControlsData['control'], 'interval'>;
    },
>(controlsData: T[]): Date[] {
    // Set<Date> doesn't work so we need to store the getTime() value
    const datetimeUniqueValues = new Set<number>(
        controlsData.flatMap((controlData) => [
            controlData.control.interval.start.getTime(),
            getDerControlEndDate(controlData.control).getTime(),
        ]),
    );

    const sortedDatetime = Array.from(datetimeUniqueValues)
        .sort()
        .map((value) => new Date(value));

    return sortedDatetime;
}

// build a list of schedules for each time chunk (start/end)
// resolve multiple controls for the same time chunk by priority (and creation time)
// the output of this schedule may have multiple consecutive chunks that are for the same control
function buildChunkedControlsScheduleByPriority({
    activeOrScheduledControls,
    sortedDatetimes,
    onSupersededControl,
}: {
    activeOrScheduledControls: MergedControlsData[];
    sortedDatetimes: Date[];
    onSupersededControl?: (controls: {
        supersededControl: DERControl;
        supersedingControl: DERControl;
    }) => void;
}) {
    const controlsSchedules: ControlSchedule[] = [];

    for (let i = 0; i < sortedDatetimes.length; i++) {
        const datetimeEvent = sortedDatetimes[i]!;
        const nextdateTimeEvent = sortedDatetimes[i + 1] ?? null;

        // find all controls that are active at this datetime
        // we don't need to worry about when the control ends because we assume the next datetimeEvent will handle that
        const controlsAtTime = activeOrScheduledControls.filter(
            (control) =>
                control.control.interval.start <= datetimeEvent &&
                getDerControlEndDate(control.control) > datetimeEvent,
        );

        if (controlsAtTime.length === 0) {
            continue;
        }

        // sort controls by priority
        const sortedControls = controlsAtTime.sort(
            sortByProgramPrimacyAndEventCreationTime,
        );

        // get the top priority control
        const firstControl = sortedControls.at(0)!;

        if (sortedControls.length > 1) {
            // for the superseded events we need to respond to
            const supersededControls = sortedControls.slice(1);

            for (const supersededControl of supersededControls) {
                void onSupersededControl?.({
                    supersededControl: supersededControl.control,
                    supersedingControl: firstControl.control,
                });
            }
        }

        // add to schedule until the next datetime event
        controlsSchedules.push({
            data: firstControl,
            startInclusive: datetimeEvent,
            endExclusive:
                nextdateTimeEvent ?? getDerControlEndDate(firstControl.control),
            randomizeStart: firstControl.control.randomizeStart,
            randomizeDuration: firstControl.control.randomizeDuration,
        });
    }

    return controlsSchedules;
}

// optimize chunked control schedules by joining consecutive schedules that have the same MRID
// this is useful for the control scheduler to know when to send the event completed response
function joinChunkedControlSchedules({
    chunkedSchedules,
}: {
    chunkedSchedules: ControlSchedule[];
}) {
    const joinedControlsSchedules: ControlSchedule[] = [];

    for (const schedule of chunkedSchedules) {
        const lastSchedule = joinedControlsSchedules.at(-1);

        if (!lastSchedule) {
            joinedControlsSchedules.push(schedule);
            continue;
        }

        if (lastSchedule.data.control.mRID === schedule.data.control.mRID) {
            // same control
            // update the end date with the current end date
            lastSchedule.endExclusive = schedule.endExclusive;
            continue;
        }

        // different control, start a new control
        joinedControlsSchedules.push(schedule);
    }

    return joinedControlsSchedules;
}

// apply the randomization factor to control schedules
// this will generate a new randomization every time we update the control schedule
// assume this is fine because we're not changing the currently active control schedule
export function applyRandomizationToControlSchedule({
    controlSchedules,
    activeControlSchedule,
}: {
    controlSchedules: ControlSchedule[];
    activeControlSchedule: RandomizedControlSchedule | null;
}) {
    const randomizedControlSchedules: RandomizedControlSchedule[] = [];

    for (const schedule of controlSchedules) {
        // do not change the currently active control schedule
        // because we don't want to change the start date to the future, it's already started
        // assume it already has randomization applied so we'll keep both the start/duration randomization
        if (
            activeControlSchedule &&
            schedule.data.control.mRID ===
                activeControlSchedule.data.control.mRID
        ) {
            randomizedControlSchedules.push(activeControlSchedule);
            continue;
        }

        const lastSchedule = randomizedControlSchedules.at(-1);

        const effectiveStartInclusive = (() => {
            const newStartTime = applyRandomizationToDatetime({
                randomizationSeconds: schedule.randomizeStart,
                date: schedule.startInclusive,
            });

            if (lastSchedule) {
                // Successive Events: When the Start Time plus Duration of the first event is the same as the Start Time of the
                // second event without randomization
                const isSuccessiveEvents = isEqual(
                    lastSchedule.endExclusive,
                    schedule.startInclusive,
                );

                const lastScheduleEndRandomized = !isEqual(
                    lastSchedule.endExclusive,
                    lastSchedule.effectiveEndExclusive,
                );

                // o) Randomization SHALL NOT cause Event conflicts or unmanaged gaps. To clarify:
                // 1) For Successive Events clients SHALL use the earlier Event’s Effective End Time as the
                // Effective Start Time of the later Event. Events are not reported as superseded and Clients
                // should report Event statuses as they normally would for a set of Successive Events. Note: This
                // means that a group of Successive Events without Duration Randomization will run
                // successively using the initial Start Randomization for each of the Events in the group.
                // 2) Randomization SHALL NOT artificially create a gap between Successive Events.

                if (isSuccessiveEvents) {
                    // if we have successive events and if the last schedule has a random duration, use it as the start time
                    if (lastScheduleEndRandomized) {
                        return lastSchedule.effectiveEndExclusive;
                    }

                    // if the last successive event did not have a random duration
                    // but the new event has a randomised start
                    // change the end time to the new randomised start time
                    lastSchedule.effectiveEndExclusive = newStartTime;
                }

                // if the events are not successive, ensure the new start time is after the last end time
                // otherwise randomization on either (positive) end time of the previous event or (negative) start time of the current event may cause conflicts
                return max([lastSchedule.effectiveEndExclusive, newStartTime]);
            }

            return newStartTime;
        })();

        const effectiveEndExclusive = applyRandomizationToDatetime({
            randomizationSeconds: schedule.randomizeDuration,
            date: schedule.endExclusive,
        });

        randomizedControlSchedules.push({
            ...schedule,
            effectiveStartInclusive,
            effectiveEndExclusive,
        });
    }

    return randomizedControlSchedules;
}

export function applyRandomizationToDatetime({
    randomizationSeconds,
    date,
}: {
    randomizationSeconds: number | undefined;
    date: Date;
}) {
    if (!randomizationSeconds || randomizationSeconds === 0) {
        return date;
    }

    const randomValue = randomInt(
        Math.min(randomizationSeconds, 0),
        Math.max(
            // random value is exclusive, we want it to be inclusive
            randomizationSeconds + 1,
            0,
        ),
    );

    return addSeconds(date, randomValue);
}
