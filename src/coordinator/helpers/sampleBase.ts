export type SampleBase = {
    date: Date;
};

export type SampleTimePeriod = {
    start: Date;
    end: Date;
    durationSeconds: number;
};

export function getSampleTimePeriod<T extends SampleBase>(
    samples: T[],
): SampleTimePeriod {
    if (samples.length === 0) {
        throw new Error('No samples to calculate time period');
    }

    const start = samples.at(0)!.date;
    const end = samples.at(-1)!.date;
    const durationSeconds = Math.round(
        (end.getTime() - start.getTime()) / 1000,
    );

    return {
        start,
        end,
        durationSeconds,
    };
}
