import { randomUUID } from 'crypto';
import type { DERControl } from '../../src/sep2/models/derControl';
import { ResponseRequiredType } from '../../src/sep2/models/responseRequired';
import { CurrentStatus } from '../../src/sep2/models/eventStatus';
import type { DERControlBase } from '../../src/sep2/models/derControlBase';

export function generateMockDERControl({
    creationTime,
    derControlBase,
    intervalStart,
    duration,
}: {
    creationTime?: Date;
    derControlBase?: DERControlBase;
    intervalStart?: Date;
    duration?: number;
}): DERControl {
    const mrid = randomUUID();

    return {
        creationTime: creationTime ?? new Date(),
        mRID: randomUUID(),
        responseRequired:
            ResponseRequiredType.MessageReceived |
            ResponseRequiredType.SpecificResponse,
        subscribable: false,
        href: `/api/v2/derp/TESTPRG2/derc/${mrid}`,
        replyToHref: '/api/v2/rsps/res-ms/rsp',
        version: 0,
        interval: {
            start: intervalStart ?? new Date(),
            duration: duration ?? 1800,
        },
        eventStatus: {
            currentStatus: CurrentStatus.Scheduled,
            dateTime: new Date(),
            potentiallySuperseded: false,
            potentiallySupersededTime: new Date(),
            reason: '',
        },
        derControlBase: derControlBase ?? {
            opModExpLimW: {
                value: 1,
                multiplier: 4,
            },
        },
    };
}
