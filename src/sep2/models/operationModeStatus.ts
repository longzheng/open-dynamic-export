import { z } from 'zod';

/// DER OperationalModeStatus value:
/// 0 - Not applicable / Unknown
/// 1 - Off
/// 2 - Operational mode
/// 3 - Test mode
/// All other values reserved.
export enum OperationalModeStatusValue {
    NotApplicable = 0,
    Off = 1,
    OperationalMode = 2,
    TestMode = 3,
}

const operationalModeStatusValueSchema = z.nativeEnum(
    OperationalModeStatusValue,
);

export const operationalModeStatusSchema = z.object({
    dateTime: z.coerce.date(),
    value: operationalModeStatusValueSchema,
});
