function validateIntervalSeconds(intervalSeconds: number) {
    if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
        throw new Error('Interval must be greater than 0 seconds');
    }
}

export function getUtcTickStart({
    intervalSeconds,
    date = new Date(),
}: {
    intervalSeconds: number;
    date?: Date;
}): Date {
    validateIntervalSeconds(intervalSeconds);

    const intervalMs = intervalSeconds * 1_000;
    const currentMs = date.getTime();

    return new Date(Math.floor(currentMs / intervalMs) * intervalMs);
}

// calculate the delay until the next UTC interval tick.
// for example, a 300 second interval will return the delay until the next :00, :05, :10... mark.
export function getMillisecondsToNextUtcIntervalTick(
    intervalSeconds: number,
): number {
    validateIntervalSeconds(intervalSeconds);

    const now = new Date();
    const intervalMs = intervalSeconds * 1_000;
    const currentTickStart = getUtcTickStart({ intervalSeconds, date: now });
    const nextTick = currentTickStart.getTime() + intervalMs;

    return nextTick - now.getTime();
}
