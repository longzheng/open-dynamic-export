import { z } from 'zod';

// 3 = Time obtained from external authoritative source such as NTP
// 4 = Time obtained from level 3 source
// 5 = Time manually set or obtained from level 4 source
// 6 = Time obtained from level 5 source
// 7 = Time intentionally uncoordinated
export enum TimeQuality {
    External = '3',
    Level3 = '4',
    Level4 = '5',
    Level5 = '6',
    Uncoordinated = '7',
}

export const timeQualitySchema = z.nativeEnum(TimeQuality);
