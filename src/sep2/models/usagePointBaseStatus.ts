import { z } from 'zod';

export enum UsagePointBaseStatus {
    Off = '0',
    On = '1',
}

export const usagePointBaseStatusSchema = z.nativeEnum(UsagePointBaseStatus);
