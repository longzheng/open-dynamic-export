import { connectStatusSchema } from './connectStatus.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { numberToHex } from '../../helpers/number.js';
import { operationalModeStatusSchema } from './operationModeStatus.js';
import { z } from 'zod';
import { stateOfChargeStatusSchema } from './stateOfChargeStatus.js';

export const derStatusSchema = z.object({
    readingTime: z.coerce.date(),
    operationalModeStatus: operationalModeStatusSchema,
    genConnectStatus: connectStatusSchema,
    storConnectStatus: connectStatusSchema.optional(),
    stateOfChargeStatus: stateOfChargeStatusSchema.optional(),
});

export type DERStatus = z.infer<typeof derStatusSchema>;

export function generateDerStatusResponse({
    readingTime,
    operationalModeStatus,
    genConnectStatus,
    storConnectStatus,
    stateOfChargeStatus,
}: DERStatus) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: { DERStatus: any } = {
        DERStatus: {
            $: { xmlns: xmlns._ },
            readingTime: dateToStringSeconds(readingTime),
            operationalModeStatus: {
                dateTime: dateToStringSeconds(operationalModeStatus.dateTime),
                value: operationalModeStatus.value.toString(),
            },
            genConnectStatus: {
                dateTime: dateToStringSeconds(genConnectStatus.dateTime),
                value: numberToHex(genConnectStatus.value).padStart(2, '0'),
            },
        },
    };

    if (storConnectStatus) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.DERStatus.storConnectStatus = {
            dateTime: dateToStringSeconds(storConnectStatus.dateTime),
            value: numberToHex(storConnectStatus.value).padStart(2, '0'),
        };
    }

    if (stateOfChargeStatus) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.DERStatus.stateOfChargeStatus = {
            dateTime: dateToStringSeconds(stateOfChargeStatus.dateTime),
            value: stateOfChargeStatus.value,
        };
    }

    return response;
}
