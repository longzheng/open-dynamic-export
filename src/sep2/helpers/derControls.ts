import type { Logger } from 'pino';
import type { SEP2Client } from '../client.js';
import type { DERControl } from '../models/derControl.js';
import type { DERProgram } from '../models/derProgram.js';
import type { FunctionSetAssignments } from '../models/functionSetAssignments.js';
import type { FunctionSetAssignmentsListData } from './functionSetAssignmentsList.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { DefaultDERControl } from '../models/defaultDerControl.js';
import EventEmitter from 'events';
import { DerControlResponseHelper } from './derControlResponse.js';
import { getDerControlEndDate, sortByProgramPrimacy } from './derControl.js';
import type { FallbackControl } from './fallbackControl.js';
import { CurrentStatus } from '../models/currentStatus.js';
import { ResponseStatus } from '../models/responseStatus.js';

export type MergedControlsData = {
    fsa: FunctionSetAssignments;
    program: DERProgram;
    control: DERControl;
};

export type MergedDefaultControlsData = {
    fsa: FunctionSetAssignments;
    program: DERProgram;
    defaultControl: DefaultDERControl;
};

export type DerControlsHelperChangedData = {
    activeOrScheduledControls: MergedControlsData[];
    fallbackControl: FallbackControl;
};

export class DerControlsHelper extends EventEmitter<{
    data: [DerControlsHelperChangedData];
}> {
    private logger: Logger;
    private derControlResponseHelper: DerControlResponseHelper;
    private cachedControlsData: MergedControlsData[] = [];

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.logger = pinoLogger.child({ module: 'DerControlsHelper' });
        this.derControlResponseHelper = new DerControlResponseHelper({
            client,
        });
    }

    async updateFsaData(fsaData: FunctionSetAssignmentsListData) {
        const now = new Date();

        // assumptions
        // - events are considered immutable besides the status
        //      from the IEEE 2030.5-2018 spec page 90
        //      Editing Events SHALL NOT be allowed except for updating status. Service providers SHALL
        //      cancel Events that they wish clients to not act upon and/or provide new superseding Events.
        // - missing/deleted events are not cancellations
        //      from the SEP2 spec page 91
        //      When an Event is removed from the server (e.g., due to limited storage space for the Event list)
        //      clients SHALL NOT assume the Event has been cancelled. Client devices SHALL only act on a
        //      cancellation as indicated in the rules above or an update to the Event’s Status attribute

        const defaultControl = getDefaultDerControl(fsaData);
        const newControlsData = mapMergedControlsData({ fsaData })
            // because we merged all controls across different programs and FSAs, they are ordered by FSAs/programs
            // sort all controls across all programs and FSAs
            .sort(sortMergedControlsDataByStartTimeAscending);

        // to handle missing/delete controls which are not considered cancelled
        const activeOrScheduledControls = this.cachedControlsData.filter(
            (controlData) =>
                // get existing controls that have not ended
                getDerControlEndDate(controlData.control) > now &&
                // get existing controls that are not in the new controls
                !newControlsData.some(
                    (newControl) =>
                        newControl.control.mRID === controlData.control.mRID &&
                        newControl.program.mRID === controlData.program.mRID &&
                        newControl.fsa.mRID === controlData.fsa.mRID,
                ),
        );

        for (const controlData of newControlsData) {
            // always send event received responses for new events
            await this.derControlResponseHelper.respondDerControl({
                derControl: controlData.control,
                status: ResponseStatus.EventReceived,
            });

            // When a client receives an Event with the Specified End Time in the past (Specified End Time <
            // Current Time), this Event SHALL be ignored. Note that the Duration Randomization is not used in
            // this calculation.
            if (getDerControlEndDate(controlData.control) < now) {
                continue;
            }

            // respond to the various events based on their status
            // note: this does not handle overlapping events because that is specific to a control type (e.g. OpModExpLim)
            // needs to be handled by ControlScheduler
            switch (controlData.control.eventStatus.currentStatus) {
                // Client devices SHALL be aware of Cancelled with Randomization events,
                // determine if the Cancelled event applies to them, and cancel the event immediately, using the larger of
                // (absolute value of randomizeStart) and (absolute value of randomizeDuration) as the end randomization, in
                // seconds. This Status.type SHALL NOT be used with “regular” Events, only with specializations of RandomizableEvent.
                case CurrentStatus.Cancelled:
                case CurrentStatus.CancelledWithRandomization: {
                    await this.derControlResponseHelper.respondDerControl({
                        derControl: controlData.control,
                        status: ResponseStatus.EventCancelled,
                    });

                    continue;
                }

                // control response handled by ControlScheduler logic
                case CurrentStatus.Scheduled:
                case CurrentStatus.Active:
                case CurrentStatus.Superseded: {
                    break;
                }
            }

            // add control to active controls
            activeOrScheduledControls.push(controlData);
        }

        this.emit('data', {
            activeOrScheduledControls,
            fallbackControl: defaultControl,
        });

        this.cachedControlsData = activeOrScheduledControls;
    }
}

function getDefaultDerControl(
    fsaData: FunctionSetAssignmentsListData,
): FallbackControl {
    const mergedDefaultControlsData = mapMergedDefaultControlsData({
        fsaData,
    });

    const sortedDefaultDerControl =
        mergedDefaultControlsData.sort(sortByProgramPrimacy);

    const firstDefaultDerControl = sortedDefaultDerControl.at(0);

    if (!firstDefaultDerControl) {
        return { type: 'none' };
    }

    return { type: 'default', data: firstDefaultDerControl };
}

function mapMergedControlsData({
    fsaData,
}: {
    fsaData: FunctionSetAssignmentsListData;
}): MergedControlsData[] {
    const mergedControlsData: MergedControlsData[] = [];

    for (const functionSetAssignments of fsaData) {
        for (const program of functionSetAssignments.derProgramList ?? []) {
            for (const control of program.derControls ?? []) {
                mergedControlsData.push({
                    fsa: functionSetAssignments.functionSetAssignments,
                    program: program.program,
                    control,
                });
            }
        }
    }

    return mergedControlsData;
}

function mapMergedDefaultControlsData({
    fsaData,
}: {
    fsaData: FunctionSetAssignmentsListData;
}): MergedDefaultControlsData[] {
    const mergedDefaultControlsData: MergedDefaultControlsData[] = [];

    for (const functionSetAssignments of fsaData) {
        for (const program of functionSetAssignments.derProgramList ?? []) {
            if (!program.defaultDerControl) {
                continue;
            }

            mergedDefaultControlsData.push({
                fsa: functionSetAssignments.functionSetAssignments,
                program: program.program,
                defaultControl: program.defaultDerControl,
            });
        }
    }

    return mergedDefaultControlsData;
}

export function sortMergedControlsDataByStartTimeAscending(
    a: MergedControlsData,
    b: MergedControlsData,
) {
    return (
        a.control.interval.start.getTime() - b.control.interval.start.getTime()
    );
}
