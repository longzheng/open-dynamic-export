import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { numberToHex } from '../../helpers/number.js';
import { connectStatusSchema } from './connectStatus.js';
import { operationalModeStatusSchema } from './operationModeStatus.js';
import { stateOfChargeStatusSchema } from './stateOfChargeStatus.js';
import { storageModeStatusSchema } from './storageModeStatus.js';

export const derStatusSchema = v.object({
    readingTime: coerceDateSchema,
    operationalModeStatus: operationalModeStatusSchema,
    genConnectStatus: connectStatusSchema,
    storConnectStatus: v.optional(connectStatusSchema),
    stateOfChargeStatus: v.optional(stateOfChargeStatusSchema),
    storageModeStatus: v.optional(storageModeStatusSchema),
});

export type DERStatus = v.InferOutput<typeof derStatusSchema>;

export function generateDerStatusResponse({
    readingTime,
    operationalModeStatus,
    genConnectStatus,
    storConnectStatus,
    stateOfChargeStatus,
    storageModeStatus,
}: DERStatus) {
    return {
        DERStatus: {
            $: { xmlns: xmlns._ },
            genConnectStatus: {
                dateTime: dateToStringSeconds(genConnectStatus.dateTime),
                value: numberToHex(genConnectStatus.value).padStart(2, '0'),
            },
            operationalModeStatus: {
                dateTime: dateToStringSeconds(operationalModeStatus.dateTime),
                value: operationalModeStatus.value.toString(),
            },
            readingTime: dateToStringSeconds(readingTime),
            stateOfChargeStatus: stateOfChargeStatus
                ? {
                      dateTime: dateToStringSeconds(
                          stateOfChargeStatus.dateTime,
                      ),
                      value: stateOfChargeStatus.value,
                  }
                : undefined,
            storageModeStatus: storageModeStatus
                ? {
                      dateTime: dateToStringSeconds(storageModeStatus.dateTime),
                      value: storageModeStatus.value.toString(),
                  }
                : undefined,
            storConnectStatus: storConnectStatus
                ? {
                      dateTime: dateToStringSeconds(storConnectStatus.dateTime),
                      value: numberToHex(storConnectStatus.value).padStart(
                          2,
                          '0',
                      ),
                  }
                : undefined,
        },
    };
}
