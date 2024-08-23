import type { Logger } from 'pino';
import type { SEP2Client } from '../client';
import { logger as pinoLogger } from '../../helpers/logger';
import { ResponseStatus } from '../models/derControlResponse';
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

export class ControlSchedulerHelper<ControlKey extends ControlType> {
    private client: SEP2Client;
    private derControlResponseHelper: DerControlResponseHelper;
    private logger: Logger;
    private controlType: ControlKey;
    private fallbackControl: FallbackControl = {
        type: 'none',
    };
    private controlSchedules: ControlSchedule[] = [];
    private activeControlSchedule: ControlSchedule | null = null;

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
    }

    public getActiveScheduleDerControlBaseValue(): DERControlBaseValueOfType<ControlKey> {
        // calculate the active control schedule from the schedule
        const newActiveControlSchedule = this.findActiveControlScheduleForNow();

        if (
            this.activeControlSchedule?.data.control.mRID !==
            newActiveControlSchedule?.data.control.mRID
        ) {
            // if the schedule should be changed
            if (this.activeControlSchedule) {
                const activeControlScheduleEnd = this.activeControlSchedule.end;
                const activeControlScheduleEndedSuccessfully =
                    activeControlScheduleEnd < new Date();

                if (activeControlScheduleEndedSuccessfully) {
                    this.logger.info(
                        { activeControlSchedule: this.activeControlSchedule },
                        'Active control schedule completed',
                    );

                    // send event completed response
                    void this.derControlResponseHelper.respondDerControl({
                        derControl: this.activeControlSchedule.data.control,
                        status: ResponseStatus.EventCompleted,
                    });
                } else {
                    this.logger.warn(
                        { activeControlSchedule: this.activeControlSchedule },
                        'Active control schedule aborted before end time',
                    );

                    // we don't need to worry about cancelled or superseded events here because they are handled by the DerControlsHelper
                    // we only need to worry about aborted by another program
                    if (
                        newActiveControlSchedule &&
                        this.activeControlSchedule.data.program.mRID !==
                            newActiveControlSchedule.data.program.mRID
                    ) {
                        this.logger.warn(
                            {
                                activeControlScheduleProgramMrid:
                                    this.activeControlSchedule.data.program
                                        .mRID,
                                newActiveControlScheduleProgramMrid:
                                    newActiveControlSchedule.data.program.mRID,
                            },
                            'Active control schedule aborted by another program',
                        );

                        // send event aborted by another program response
                        void this.derControlResponseHelper.respondDerControl({
                            derControl: this.activeControlSchedule.data.control,
                            status: ResponseStatus.EventAbortedProgram,
                        });
                    }
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
                    { newActiveControlSchedule },
                    'Active control schedule started',
                );

                // send event started response
                void this.derControlResponseHelper.respondDerControl({
                    derControl: newActiveControlSchedule.data.control,
                    status: ResponseStatus.EventStarted,
                });
            } else {
                this.logger.info(
                    { defaultControl: this.fallbackControl },
                    'Default control started',
                );
            }

            // set the new active control schedule
            this.activeControlSchedule = newActiveControlSchedule;
        }

        if (this.activeControlSchedule) {
            return this.activeControlSchedule.data.control.derControlBase[
                this.controlType
            ];
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

    private findActiveControlScheduleForNow(): ControlSchedule | null {
        const nowSchedules = this.controlSchedules.filter(
            (control) =>
                control.start <= new Date() && control.end > new Date(),
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

    // build schedule from datetime events from earliest to latest
    const sortedDatetimeEvents = Array.from(datetimeUniqueValues)
        .sort()
        .map((value) => new Date(value));
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
