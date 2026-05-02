import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';

export const registrationSchema = v.intersect([
    v.object({
        dateTimeRegistered: coerceDateSchema,
        pIN: v.number(),
        pollRate: pollRateSchema,
    }),
    resourceSchema,
]);

export type Registration = v.InferOutput<typeof registrationSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseRegistrationXml(xml: any): Registration {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xml['Registration']);
    const pollRate = parsePollRateXmlObject(xml['Registration']);
    const dateTimeRegistered = stringIntToDate(
        assertString(xml['Registration']['dateTimeRegistered'][0]),
    );
    const pIN = safeParseIntString(assertString(xml['Registration']['pIN'][0]));
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        pollRate,
        dateTimeRegistered,
        pIN,
    };
}
