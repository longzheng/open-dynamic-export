import { dateToStringSeconds } from '../helpers/date';
import { xmlns } from '../helpers/namespace';

// The status field contains the acknowledgement or status. Each event type (DRLC, DER, Price, or Text) can return different status information (e.g. an Acknowledge will be returned for a Price event where a DRLC event can return Event Received, Event Started, and Event Completed). The Status field value definitions are defined in Table 27: Response Types by Function Set.
// EventReceived = 1,
// EventStarted = 2,
// EventCompleted = 3,
// EventOptOut = 4,
// EventOptIn = 5,
// EventCancelled = 6,
// EventSuperseded = 7,
// EventPartialOptOut = 8,
// EventPartialOptIn = 9,
// EventCompletedNoUserParticipation = 10,
// EventAcknowledge = 11,
// EventNoDisplay = 12,
// EventAbortedServer = 13,
// EventAbortedProgram = 14,
// EventNotApplicable = 252,
// EventInvalid = 253,
// EventExpired = 254,
export enum ResponseStatus {
    EventReceived = 1,
    EventStarted = 2,
    EventCompleted = 3,
    EventOptOut = 4,
    EventOptIn = 5,
    EventCancelled = 6,
    EventSuperseded = 7,
    EventPartialOptOut = 8,
    EventPartialOptIn = 9,
    EventCompletedNoUserParticipation = 10,
    EventAcknowledge = 11,
    EventNoDisplay = 12,
    EventAbortedServer = 13,
    EventAbortedProgram = 14,
    EventNotApplicable = 252,
    EventInvalid = 253,
    EventExpired = 254,
}

export type DerControlResponse = {
    createdDateTime: Date;
    endDeviceLFDI: string;
    status: ResponseStatus;
    // the mRID of the DERControl that is being responded to
    subject: string;
};

export function generateDerControlResponse({
    createdDateTime,
    endDeviceLFDI,
    status,
    subject,
}: DerControlResponse) {
    return {
        DERControlResponse: {
            $: { xmlns: xmlns._ },
            createdDateTime: dateToStringSeconds(createdDateTime),
            endDeviceLFDI,
            status: status.toString(),
            subject,
        },
    };
}
