import { connectStatusSchema } from './connectStatus.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { numberToHex } from '../../helpers/number.js';
import { operationalModeStatusSchema } from './operationModeStatus.js';
import { z } from 'zod';

export const derStatusSchema = z.object({
    readingTime: z.coerce.date(),
    operationalModeStatus: z.object({
        dateTime: z.coerce.date(),
        value: operationalModeStatusSchema,
    }),
    genConnectStatus: z.object({
        dateTime: z.coerce.date(),
        value: connectStatusSchema,
    }),
});

export type DERStatus = z.infer<typeof derStatusSchema>;

export function generateDerStatusResponse({
    readingTime,
    operationalModeStatus,
    genConnectStatus,
}: DERStatus) {
    return {
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
}
