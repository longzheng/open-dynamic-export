import { z } from 'zod';

// Used for percentages, specified in hundredths of a percent, 0 - 10000. (10000 = 100%)
export const perCentSchema = z.number().int().min(0).max(10000);
