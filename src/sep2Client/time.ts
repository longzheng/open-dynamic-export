import { assertIsString } from '../assert';
import { safeParseInt } from '../number';

export type TimeResponse = {
    currentTime: Date;
    // TODO more fields
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeXml(xml: any): TimeResponse {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const currentTimeString = xml['Time']['currentTime'][0];
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    assertIsString(currentTimeString);

    const currentTimeInt = safeParseInt(currentTimeString);
    const currentTimeDate = new Date(currentTimeInt * 1000);

    return {
        currentTime: currentTimeDate,
    };
}
