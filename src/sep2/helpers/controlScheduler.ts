import type { Logger } from 'pino';
import type { SEP2Client } from '../client';
import { logger as pinoLogger } from '../../helpers/logger';
import { ResponseStatus } from '../models/derControlResponse';
import EventEmitter from 'events';
import type { DERControlBase } from '../models/derControlBase';
import type {
    DerControlsHelperChangedData,
    FallbackControl,
    MergedControlsData,
} from './derControls';
import { DerControlResponseHelper } from './derControlResponse';
import {
    getDerControlEndDate,
    sortByProgramPrimacyAndEventCreationTime,
} from './derControl';
import { CurrentStatus } from '../models/eventStatus';

export type ControlType = keyof DERControlBase;

type DERControlBaseValueOfType<ControlKey extends ControlType> =
    DERControlBase[ControlKey];

export type ControlSchedule = {
    start: Date;
    end: Date;
    data: MergedControlsData;
};

export type ChangedEventData =
    | {
          type: 'schedule';
          onStart: () => void;
      }
    | {
          type: 'fallback';
      };

export class ControlSchedulerHelper<
    ControlKey extends ControlType,
> extends EventEmitter<{
    activeScheduleChanged: [ChangedEventData];
}> {
    private client: SEP2Client;
    private derControlResponseHelper: DerControlResponseHelper;
    private logger: Logger;
    private controlType: ControlKey;
    private fallbackControl: FallbackControl = {
        type: 'none',
    };
    private controlSchedules: ControlSchedule[] = [];

    private activeControlSchedule: {
        controlSchedule: ControlSchedule;
        onCompleteTimer: NodeJS.Timeout;
    } | null = null;

    constructor({
        client,
        controlType,
    }: {
        client: SEP2Client;
        controlType: ControlKey;
    }) {
        super();

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

    updateControlsData(data: DerControlsHelperChangedData) {
        this.fallbackControl = data.fallbackControl;

        const activeOrScheduledControls = data.controls.filter(
            ({ control }) =>
                control.eventStatus.currentStatus === CurrentStatus.Active ||
                control.eventStatus.currentStatus === CurrentStatus.Scheduled,
        );

        const controlsOfType = filterControlsOfType({
            controls: activeOrScheduledControls,
            type: this.controlType,
        });

        this.controlSchedules = generateControlsSchedule({
            controls: controlsOfType,
        });

        this.logger.debug(
            { controlSchedules: this.controlSchedules },
            'Updated control schedules',
        );

        // TODO: randomization of schedules

        // there is a chance of a race condition between SEP2 DerControls data being updated
        // and the control schedule ending
        // check if the active control is ending in the next 5 seconds, if so just let it run its course
        const activeControlEndingMilliseconds = this.activeControlSchedule
            ? this.activeControlSchedule.controlSchedule.end.getTime() -
              new Date().getTime()
            : null;
        if (
            activeControlEndingMilliseconds &&
            activeControlEndingMilliseconds < 5000
        ) {
            this.logger.info(
                { activeControlEndingMilliseconds },
                'Active control schedule ending soon, waiting for it to complete',
            );
            return;
        }

        const activeControlSchedule = this.findActiveScheduleForNow();
        if (
            activeControlSchedule?.data.control.mRID !==
            this.activeControlSchedule?.controlSchedule.data.control.mRID
        ) {
            this.emit(
                'activeScheduleChanged',
                this.getChangedEventData(activeControlSchedule),
            );
        }
    }

    public getActiveScheduleDerControlBaseValue(): DERControlBaseValueOfType<ControlKey> {
        if (this.activeControlSchedule) {
            return this.activeControlSchedule.controlSchedule.data.control
                .derControlBase[this.controlType];
        }

        switch (this.fallbackControl.type) {
            case 'default':
                return this.fallbackControl.data.defaultControl.derControlBase[
                    this.controlType
                ];
            case 'none':
                return undefined;
        }
    }

    private getOnCompleteTimer(controlSchedule: ControlSchedule) {
        return setTimeout(() => {
            this.logger.info(
                { controlSchedule },
                'Active control schedule completed',
            );

            // respond to
            void this.derControlResponseHelper.respondDerControl({
                derControl: controlSchedule.data.control,
                status: ResponseStatus.EventCompleted,
            });

            // remove schedule from list
            this.controlSchedules.filter(
                (schedule) =>
                    schedule.data.control.mRID !==
                    controlSchedule.data.control.mRID,
            );

            const activeSchedule = this.findActiveScheduleForNow();

            this.emit(
                'activeScheduleChanged',
                this.getChangedEventData(activeSchedule),
            );
        }, controlSchedule.end.getTime() - new Date().getTime());
    }

    private findActiveScheduleForNow(): ControlSchedule | null {
        return (
            this.controlSchedules.find(
                (control) =>
                    control.start <= new Date() && control.end > new Date(),
            ) ?? null
        );
    }

    private getChangedEventData(
        activeSchedule: ControlSchedule | null,
    ): ChangedEventData {
        if (!activeSchedule) {
            return {
                type: 'fallback',
            };
        }

        return {
            type: 'schedule',
            onStart: () => {
                this.onActiveScheduleStarted(activeSchedule);
            },
        };
    }

    private onActiveScheduleStarted(controlSchedule: ControlSchedule) {
        this.logger.info(
            { controlSchedule },
            'Active control schedule started',
        );

        if (this.activeControlSchedule) {
            this.logger.info(
                { activeControlSchedule: this.activeControlSchedule },
                'Aborting existing active control schedule',
            );

            // aborted early
            // stop the existing onCompleteTimer scheduled for when the event was suppose to stop
            clearTimeout(this.activeControlSchedule.onCompleteTimer);

            // if the new event is from a different program event, send a response
            if (
                this.activeControlSchedule.controlSchedule.data.program.mRID !==
                controlSchedule.data.program.mRID
            ) {
                void this.derControlResponseHelper.respondDerControl({
                    derControl:
                        this.activeControlSchedule.controlSchedule.data.control,
                    status: ResponseStatus.EventAbortedProgram,
                });
            }
        }

        // send event started response
        void this.derControlResponseHelper.respondDerControl({
            derControl: controlSchedule.data.control,
            status: ResponseStatus.EventStarted,
        });

        this.activeControlSchedule = {
            controlSchedule,
            onCompleteTimer: this.getOnCompleteTimer(controlSchedule),
        };
    }
}

export function filterControlsOfType<
    T extends {
        control: Pick<MergedControlsData['control'], 'derControlBase'>;
    },
>({ controls, type }: { controls: T[]; type: ControlType }) {
    return controls.filter(
        ({ control }) =>
            Object.keys(control.derControlBase).includes(type) &&
            control.derControlBase[type] !== undefined,
    );
}

export function generateControlsSchedule({
    controls,
}: {
    // assume only active or scheduled controls
    controls: MergedControlsData[];
}): ControlSchedule[] {
    const controlsSchedules: ControlSchedule[] = [];

    if (controls.length === 0) {
        return controlsSchedules;
    }

    // get all unique start and end datetimes
    // Set<Date> doesn't work so we need to store the getTime() value
    const datetimeUniqueValues = new Set<number>();

    for (const controlData of controls) {
        datetimeUniqueValues.add(controlData.control.interval.start.getTime());
        datetimeUniqueValues.add(
            getDerControlEndDate(controlData.control).getTime(),
        );
    }

    // build schedule from datetime events
    const sortedDatetimeEvents = Array.from(datetimeUniqueValues)
        .map((value) => new Date(value))
        .sort();
    for (let i = 0; i < sortedDatetimeEvents.length; i++) {
        const datetimeEvent = sortedDatetimeEvents[i]!;
        const nextdateTimeEvent = sortedDatetimeEvents[i + 1] ?? null;

        // find all controls that are active at this datetime
        // we don't need to worry about when the control ends because we assume the next datetimeEvent will handle that
        const controlsAtTime = controls.filter(
            (control) =>
                control.control.interval.start <= datetimeEvent &&
                getDerControlEndDate(control.control) > datetimeEvent,
        );

        if (controlsAtTime.length === 0) {
            continue;
        }

        // get the top control by priority
        const sortedControls = controlsAtTime
            .sort(sortByProgramPrimacyAndEventCreationTime)
            .at(0)!;

        // add to schedule until the next datetime event
        controlsSchedules.push({
            start: datetimeEvent,
            end:
                nextdateTimeEvent ??
                getDerControlEndDate(sortedControls.control),
            data: sortedControls,
        });
    }

    // join consequent schedules that have the same MRID
    const joinedControlsSchedules: ControlSchedule[] = [];
    for (const schedule of controlsSchedules) {
        const lastSchedule = joinedControlsSchedules.at(-1);

        if (!lastSchedule) {
            joinedControlsSchedules.push(schedule);
            continue;
        }

        if (lastSchedule.data.control.mRID === schedule.data.control.mRID) {
            // same control
            // update the end date with the current end date
            lastSchedule.end = schedule.end;
            continue;
        }

        // different control, start a new control
        joinedControlsSchedules.push(schedule);
    }

    return joinedControlsSchedules;
}
