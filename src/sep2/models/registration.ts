import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';
import { parsePollRateXmlObject, type PollRate } from './pollRate.js';
import { parseResourceXmlObject, type Resource } from './resource.js';

export type Registration = {
    dateTimeRegistered: Date;
    pIN: number;
    pollRate: PollRate;
} & Resource;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseRegistrationXml(xml: any): Registration {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xml['Registration']);
    const pollRate = parsePollRateXmlObject(xml['Registration']);
    const dateTimeRegistered = stringIntToDate(
        assertString(xml['Registration']['dateTimeRegistered'][0]),
    );
    const pIN = safeParseIntString(assertString(xml['Registration']['pIN'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        pollRate,
        dateTimeRegistered,
        pIN,
    };
}
