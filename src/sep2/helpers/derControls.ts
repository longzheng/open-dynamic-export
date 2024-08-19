import type { Logger } from 'pino';
import type { SEP2Client } from '../client';
import type { DERControl } from '../models/derControl';
import type { DERProgram } from '../models/derProgram';
import type { FunctionSetAssignments } from '../models/functionSetAssignments';
import type { FunctionSetAssignmentsListData } from './functionSetAssignmentsList';
import { logger as pinoLogger } from '../../helpers/logger';
import { ResponseStatus } from '../models/derControlResponse';
import { generateDerControlResponse } from '../models/derControlResponse';
import { objectToXml } from './xml';
import type { DefaultDERControl } from '../models/defaultDerControl';
import EventEmitter from 'events';
import { CurrentStatus } from '../models/eventStatus';
import { randomNumber } from '../../helpers/number';
import type { DERControlBase } from '../models/derControlBase';

export type FlatControlsData = {
    fsa: FunctionSetAssignments;
    program: DERProgram;
    control: DERControl;
};

export type FlatDefaultControlsData = {
    fsa: FunctionSetAssignments;
    program: DERProgram;
    defaultControl: DefaultDERControl;
};

type ControlData =
    | {
          type: 'none';
      }
    | {
          type: 'default';
          control: FlatDefaultControlsData;
      }
    | {
          type: 'control';
          control: FlatControlsData;
      };

type ControlsSchedules = {
    start: Date;
    end: Date;
    control: ControlData;
}[];

type EligibleControlTypes = keyof DERControlBase;

export class DerControlsHelper extends EventEmitter<{
    controlChanged: [ControlData];
}> {
    private client: SEP2Client;
    private logger: Logger;
    private controlTypes: EligibleControlTypes[];
    private eligibleControlsData: FlatControlsData[] = [];

    private controlsSchedules: ControlsSchedules = [];

    private currentlyActiveControl: {
        data: ControlData;
        onCompleteTimer: NodeJS.Timeout | null;
    } | null = null;

    constructor({
        client,
        eligibleControls,
    }: {
        client: SEP2Client;
        eligibleControls: EligibleControlTypes[];
    }) {
        super();

        this.client = client;
        this.controlTypes = eligibleControls;
        this.logger = pinoLogger.child({ module: 'DerControlsHelper' });
    }

    updateFsaData(fsaData: FunctionSetAssignmentsListData) {
        // we can't overwrite the flatControlsData array because deleted events are not cancellations
        // from the SEP2 spec page 91
        // When an Event is removed from the server (e.g., due to limited storage space for the Event list)
        // clients SHALL NOT assume the Event has been cancelled. Client devices SHALL only act on a
        // cancellation as indicated in the rules above or an update to the Event’s Status attribute

        const newControlsData = flatMapControlsData({ fsaData });

        // get existing controls mRIDs to figure out what controls are new
        // we need to know what is new to send "event received" responses
        const existingControlsMrids = this.eligibleControlsData.map(
            ({ control }) => control.mRID,
        );

        for (const controlData of newControlsData) {
            // When a client receives an Event with the Specified End Time in the past (Specified End Time <
            // Current Time), this Event SHALL be ignored. Note that the Duration Randomization is not used in
            // this calculation.
            if (getDerControlEndDate(controlData.control) < new Date()) {
                // For function sets with direct control, if the Event responseRequired indicates, clients SHALL
                // POST a Response to the replyTo URI with a Status of “Rejected - Event was received after it
                // had expired”.
                void this.respondDerControl({
                    derControl: controlData.control,
                    status: ResponseStatus.EventExpired,
                });

                continue;
            }

            switch (controlData.control.eventStatus.currentStatus) {
                case CurrentStatus.Scheduled:
                case CurrentStatus.Active: {
                    if (
                        !existingControlsMrids.includes(
                            controlData.control.mRID,
                        )
                    ) {
                        // respond to
                        void this.respondDerControl({
                            derControl: controlData.control,
                            status: ResponseStatus.EventReceived,
                        });

                        // add to eligibleControlsData
                        this.eligibleControlsData.push(controlData);
                    }
                    break;
                }
                case CurrentStatus.Cancelled: {
                    if (
                        !existingControlsMrids.includes(
                            controlData.control.mRID,
                        )
                    ) {
                        // respond to
                        void this.respondDerControl({
                            derControl: controlData.control,
                            status: ResponseStatus.EventCancelled,
                        });

                        // remove from eligibleControlsData
                        this.eligibleControlsData =
                            this.eligibleControlsData.filter(
                                ({ control }) =>
                                    control.mRID !== controlData.control.mRID,
                            );
                    }
                    break;
                }
                // Client devices SHALL be aware of Cancelled with Randomization events,
                // determine if the Cancelled event applies to them, and cancel the event immediately, using the larger of
                // (absolute value of randomizeStart) and (absolute value of randomizeDuration) as the end randomization, in
                // seconds. This Status.type SHALL NOT be used with “regular” Events, only with specializations of RandomizableEvent.
                case CurrentStatus.CancelledWithRandomization: {
                    if (
                        !existingControlsMrids.includes(
                            controlData.control.mRID,
                        )
                    ) {
                        const randomEndSeconds = Math.max(
                            controlData.control.randomizeStart ?? 0,
                            controlData.control.randomizeDuration ?? 0,
                        );

                        const randomSeconds = randomNumber(0, randomEndSeconds);

                        setTimeout(() => {
                            // respond to
                            void this.respondDerControl({
                                derControl: controlData.control,
                                status: ResponseStatus.EventCancelled,
                            });

                            // remove from eligibleControlsData
                            this.eligibleControlsData =
                                this.eligibleControlsData.filter(
                                    ({ control }) =>
                                        control.mRID !==
                                        controlData.control.mRID,
                                );
                        }, randomSeconds * 1000);
                    }
                    break;
                }
                // Client devices encountering a Superseded event SHALL terminate execution of the event immediately and
                // commence execution of the new event immediately, unless the current time is within the start
                // randomization window of the superseded event, in which case the client SHALL obey the start
                // randomization of the new event. This Status.type SHALL NOT be used with TextMessage, since multiple
                // text messages can be active.
                case CurrentStatus.Superseded: {
                    if (
                        !existingControlsMrids.includes(
                            controlData.control.mRID,
                        )
                    ) {
                        // respond to
                        void this.respondDerControl({
                            derControl: controlData.control,
                            status: ResponseStatus.EventSuperseded,
                        });

                        // remove from eligibleControlsData
                        this.eligibleControlsData =
                            this.eligibleControlsData.filter(
                                ({ control }) =>
                                    control.mRID !== controlData.control.mRID,
                            );
                    }
                    break;
                }
            }
        }

        this.generateControlsSchedule();
    }

    private generateControlsSchedule() {
        this.controlsSchedules = generateControlsSchedule({
            controls: this.eligibleControlsData,
            types: this.controlTypes,
        });
    }

    private evaluateActiveControl() {}

    private async respondDerControl({
        derControl,
        status,
    }: {
        derControl: DERControl;
        status: ResponseStatus;
    }) {
        // TODO: check for responseRequired field and respond accordingly

        if (!derControl.replyToHref) {
            this.logger.warn(
                { derControl },
                'DERControl does not have a replyToHref',
            );

            return;
        }

        const response = generateDerControlResponse({
            createdDateTime: new Date(),
            endDeviceLFDI: this.client.lfdi,
            status,
            subject: derControl.mRID,
        });

        this.logger.debug(
            { derControl, response },
            'respondReceivedDerControl',
        );

        const xml = objectToXml(response);

        await this.client.post(derControl.replyToHref, xml);
    }
}

export function sortByProgramPrimacy<
    T extends { program: Pick<DERProgram, 'primacy'> },
>(a: T, b: T) {
    // lowest primacy first
    return a.program.primacy - b.program.primacy;
}

// When comparing two Nested Events or Overlapping Events from servers with the same primacy,
// the creationTime element SHALL be used to determine which Event is newer and therefore
// supersedes the older. The Event with the larger (e.g., more recent) creationTime is the newer Event.
export function sortByProgramPrimacyAndEventCreationTime<
    T extends {
        program: Pick<DERProgram, 'primacy'>;
        control: Pick<DERControl, 'creationTime'>;
    },
>(a: T, b: T) {
    return (
        // lowest primacy first
        a.program.primacy - b.program.primacy ||
        // newest event first
        b.control.creationTime.getTime() - a.control.creationTime.getTime()
    );
}

export function resolveOverlappingDerControls<
    T extends {
        program: Pick<DERProgram, 'primacy'>;
        control: Pick<
            FlatControlsData['control'],
            'mRID' | 'interval' | 'creationTime'
        >;
    },
>({
    evaluateDerControl,
    allDerControls,
}: {
    evaluateDerControl: T;
    allDerControls: T[];
}): T {
    const overlappingDerControls = getOverlappingDerControls({
        evaluateDerControl,
        allDerControls,
    });

    if (overlappingDerControls.length === 0) {
        return evaluateDerControl;
    }

    const sortedDerControls = [
        evaluateDerControl,
        ...overlappingDerControls,
    ].sort(sortByProgramPrimacyAndEventCreationTime);

    return sortedDerControls.at(0)!;
}

export function getOverlappingDerControls<
    T extends {
        control: Pick<FlatControlsData['control'], 'mRID' | 'interval'>;
    },
>({
    evaluateDerControl,
    allDerControls,
}: {
    evaluateDerControl: T;
    // assumes controls have already been filtered
    // - eligible controls with the correct type
    // - all future controls with the same or later start time as the evaluated control
    allDerControls: T[];
}): T[] {
    return allDerControls.filter((derControl) => {
        // not the same control
        if (derControl.control.mRID === evaluateDerControl.control.mRID) {
            return false;
        }

        const controlStartTime = derControl.control.interval.start.getTime();
        const controlEndTime = getDerControlEndDate(
            derControl.control,
        ).getTime();
        const currentControlStartTime =
            evaluateDerControl.control.interval.start.getTime();
        const currentDerControlEndTime = getDerControlEndDate(
            evaluateDerControl.control,
        ).getTime();

        // fully within or exactly the same as the current event period
        if (
            controlStartTime >= currentControlStartTime &&
            controlEndTime <= currentDerControlEndTime
        ) {
            return true;
        }

        // we don't need to worry about partially within the event period at the start
        // because we will iterate through the events in order of start time
        // so we should have already handled this

        // partially within the current event period at the end
        if (
            // starts after the event starts but before the event ends
            controlStartTime > currentControlStartTime &&
            controlStartTime < currentDerControlEndTime &&
            // ends after the event ends
            controlEndTime > currentDerControlEndTime
        ) {
            return true;
        }

        return false;
    });
}

function getDerControlEndDate(control: Pick<DERControl, 'interval'>) {
    return new Date(
        control.interval.start.getTime() + control.interval.duration * 1000,
    );
}

function getDefaultDerControl(fsaData: FunctionSetAssignmentsListData) {
    const flatDefaultControlsData = flatMapDefaultControlsData({
        fsaData,
    });

    const sortedDefaultDerControl =
        flatDefaultControlsData.sort(sortByProgramPrimacy);

    return sortedDefaultDerControl[0] ?? null;
}

function flatMapControlsData({
    fsaData,
}: {
    fsaData: FunctionSetAssignmentsListData;
}): FlatControlsData[] {
    const flatControlsData: FlatControlsData[] = [];

    for (const functionSetAssignments of fsaData) {
        for (const program of functionSetAssignments.derProgramList ?? []) {
            for (const control of program.derControls ?? []) {
                flatControlsData.push({
                    fsa: functionSetAssignments.functionSetAssignments,
                    program: program.program,
                    control,
                });
            }
        }
    }

    return flatControlsData;
}

function flatMapDefaultControlsData({
    fsaData,
}: {
    fsaData: FunctionSetAssignmentsListData;
}): FlatDefaultControlsData[] {
    const flatDefaultControlsData: FlatDefaultControlsData[] = [];

    for (const functionSetAssignments of fsaData) {
        for (const program of functionSetAssignments.derProgramList ?? []) {
            if (!program.defaultDerControl) {
                continue;
            }

            flatDefaultControlsData.push({
                fsa: functionSetAssignments.functionSetAssignments,
                program: program.program,
                defaultControl: program.defaultDerControl,
            });
        }
    }

    return flatDefaultControlsData;
}

export function getControlsOfType<
    T extends { control: Pick<FlatControlsData['control'], 'derControlBase'> },
>({ controls, types }: { controls: T[]; types: EligibleControlTypes[] }) {
    return controls.filter(({ control }) =>
        types.some((type) =>
            Object.keys(control.derControlBase).includes(type),
        ),
    );
}

export function generateControlsSchedule({
    controls,
    types,
}: {
    controls: FlatControlsData[];
    types: EligibleControlTypes[];
}) {
    const controlsSchedules: ControlsSchedules = [];

    // we only care about controls with control types that we can action
    // we don't filter it out when receiving the data because we need to acknowledge all events
    const eligibleControlsOfType = getControlsOfType({
        controls,
        types,
    });

    for (const controlData of eligibleControlsOfType) {
        const start = controlData.control.interval.start;
        const end = getDerControlEndDate(controlData.control);

        // get all controls equal or after the start time
        const otherControls = eligibleControlsOfType.filter(
            (control) =>
                control.control.interval.start.getTime() >= start.getTime(),
        );

        // resolve overlapping events
        const resolvedControl = resolveOverlappingDerControls({
            evaluateDerControl: controlData,
            allDerControls: otherControls,
        });

        controlsSchedules.push({
            start,
            end,
            control: {
                type: 'control',
                control: resolvedControl,
            },
        });
    }

    return controlsSchedules;
}
