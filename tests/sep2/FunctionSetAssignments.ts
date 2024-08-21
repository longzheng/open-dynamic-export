import { randomUUID } from 'crypto';
import type { FunctionSetAssignments } from '../../src/sep2/models/functionSetAssignments';

export function generateMockFunctionSetAssignments({
    derProgramsCount,
}: {
    derProgramsCount?: number;
}): FunctionSetAssignments {
    const mrid = randomUUID();

    return {
        href: `/api/v2/edev/_DEVNAME/fsa/${mrid}`,
        subscribable: true,
        description: 'FSA',
        mRID: mrid,
        version: 1,
        derProgramListLink: {
            href: `/api/v2/edev/_DEVNAME/fsa/${mrid}/derp`,
            all: derProgramsCount ?? 0,
        },
        responseSetListLink: {
            href: '/api/v2/rsps',
            all: 0,
        },
        timeLink: {
            href: '/api/v2/tm',
        },
    };
}
