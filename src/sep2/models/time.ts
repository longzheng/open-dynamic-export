import { assertString } from '../helpers/assert';
import { stringIntToDate } from '../helpers/date';

export type Time = {
    currentTime: Date;
    // TODO more fields
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeXml(xml: any): Time {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const currentTime = stringIntToDate(
        assertString(xml['Time']['currentTime'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        currentTime,
    };
}
