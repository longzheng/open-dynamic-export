export type SampleBase = {
    date: Date;
};

export function getSamplesIntervalSeconds<T extends SampleBase>(samples: T[]) {
    // assume samples are in order from oldest to newest
    if (samples.length < 2) {
        return 0;
    }

    const oldest = samples.at(0)!.date;
    const newest = samples.at(-1)!.date;

    return Math.round((newest.getTime() - oldest.getTime()) / 1000);
}
