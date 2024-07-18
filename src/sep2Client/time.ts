import { assertString } from './assert';
import { stringIntToDate } from './date';

export type TimeResponse = {
    currentTime: Date;
    // TODO more fields
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeXml(xml: any): TimeResponse {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const currentTime = stringIntToDate(
        assertString(xml['Time']['currentTime'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        currentTime,
    };
}
