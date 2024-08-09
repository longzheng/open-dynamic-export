import { assertString } from '../helpers/assert';
import { stringIntToDate } from '../helpers/date';
import { parsePollRateXmlObject, type PollRate } from './pollRate';
import { parseResourceXmlObject, type Resource } from './resource';

export type Time = {
    pollRate: PollRate;
    currentTime: Date;
    // TODO more fields
} & Resource;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeXml(xml: any): Time {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xml['Time']);
    const pollRate = parsePollRateXmlObject(xml['Time']);
    const currentTime = stringIntToDate(
        assertString(xml['Time']['currentTime'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        pollRate,
        currentTime,
    };
}
