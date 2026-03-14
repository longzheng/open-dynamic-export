import { addSeconds } from 'date-fns';
import type { DERControl } from '../models/derControl.js';
import type { DERProgram } from '../models/derProgram.js';
import { CurrentStatus } from '../models/currentStatus.js';

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
        control: Pick<DERControl, 'creationTime'> & {
            eventStatus: Pick<DERControl['eventStatus'], 'currentStatus'>;
        };
    },
>(a: T, b: T) {
    const aIsSuperseded =
        a.control.eventStatus.currentStatus === CurrentStatus.Superseded;
    const bIsSuperseded =
        b.control.eventStatus.currentStatus === CurrentStatus.Superseded;

    return (
        // place controls explicitly marked as superseded last
        Number(aIsSuperseded) - Number(bIsSuperseded) ||
        // lowest primacy first
        a.program.primacy - b.program.primacy ||
        // newest event first
        b.control.creationTime.getTime() - a.control.creationTime.getTime()
    );
}

export function getDerControlEndDate(control: Pick<DERControl, 'interval'>) {
    return new Date(
        addSeconds(control.interval.start, control.interval.duration),
    );
}
