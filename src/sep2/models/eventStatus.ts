import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { assertString } from '../helpers/assert.js';
import { stringToBoolean } from '../helpers/boolean.js';
import { stringIntToDate } from '../helpers/date.js';
import { currentStatusSchema } from './currentStatus.js';

export const eventStatusSchema = v.object({
    currentStatus: currentStatusSchema,
    dateTime: coerceDateSchema,
    potentiallySuperseded: v.boolean(),
    potentiallySupersededTime: v.optional(coerceDateSchema),
    reason: v.optional(v.string()),
});

export type EventStatus = v.InferOutput<typeof eventStatusSchema>;

export function parseEventStatusXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): EventStatus {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const currentStatus = v.parse(
        currentStatusSchema,
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
