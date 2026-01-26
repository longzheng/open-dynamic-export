import * as v from 'valibot';

// Used for percentages, specified in hundredths of a percent, 0 - 10000. (10000 = 100%)
export const perCentSchema = v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0),
    v.maxValue(10000),
);
