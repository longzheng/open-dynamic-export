import { safeParseIntString } from '../../number';
import { assertString } from '../helpers/assert';

export type PollRate = {
    pollRate: number;
};

export function parsePollRateXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PollRate {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const pollRate = safeParseIntString(
        assertString(xmlObject['$']['pollRate']),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        pollRate,
    };
}
