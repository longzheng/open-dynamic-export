import { randomUUID } from 'crypto';
import type { DERProgram } from '../../src/sep2/models/derProgram.js';

export function generateMockDERProgram({
    primacy,
}: {
    primacy?: number;
}): DERProgram {
    const mrid = randomUUID();

    return {
        mRID: mrid,
        primacy: primacy ?? 0,
        subscribable: false,
        version: 0,
        href: `/api/v2/derp/${mrid}`,
        description: 'DER Program',
        defaultDerControlLink: {
            href: `/api/v2/derp/${mrid}/dderc`,
        },
        derControlListLink: {
            href: `/api/v2/derp/${mrid}/derc`,
        },
        derCurveListLink: {
            href: `/api/v2/derp/${mrid}/derc`,
        },
    };
}
