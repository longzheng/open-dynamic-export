import { assertString } from '../helpers/assert.js';
import { stringToBoolean } from '../helpers/boolean.js';
import { stringIntToDate } from '../helpers/date.js';
import { currentStatusSchema } from './currentStatus.js';
import { z } from 'zod';

export const eventStatusSchema = z.object({
    currentStatus: currentStatusSchema,
    dateTime: z.coerce.date(),
    potentiallySuperseded: z.boolean(),
    potentiallySupersededTime: z.coerce.date().optional(),
    reason: z.string().optional(),
});

export type EventStatus = z.infer<typeof eventStatusSchema>;

export function parseEventStatusXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): EventStatus {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const currentStatus = currentStatusSchema.parse(
        assertString(xmlObject['currentStatus'][0]),
    );
    const dateTime = stringIntToDate(assertString(xmlObject['dateTime'][0]));
    const potentiallySuperseded = stringToBoolean(
        assertString(xmlObject['potentiallySuperseded'][0]),
    );
    const potentiallySupersededTime = xmlObject['potentiallySupersededTime']
        ? stringIntToDate(
              assertString(xmlObject['potentiallySupersededTime'][0]),
          )
        : undefined;
    const reason = xmlObject['reason']
        ? assertString(xmlObject['reason'][0])
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        currentStatus,
        dateTime,
        potentiallySuperseded,
        potentiallySupersededTime,
        reason,
    };
}
