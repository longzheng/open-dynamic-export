// calculate the delay until the next minutes interval within the hour
// for example, 15 will return the delay until XX:15, XX:30, XX:45, or XX:00
// for example, 30 will return the delay until XX:30 or XX:00
export function getMillisecondsToNextHourMinutesInterval(
    minutesInterval: number,
): number {
    if (minutesInterval <= 0) {
        throw new Error('Interval must be greater than 0 minutes');
    }

    if (minutesInterval > 30) {
        throw new Error('Interval must be <= 30 minutes');
    }

    const now = new Date();
    const currentMinutes = now.getMinutes();
    const nextIntervalMinutes =
        Math.ceil((currentMinutes + 1) / minutesInterval) * minutesInterval;

    const nextIntervalMark = new Date(now);
    nextIntervalMark.setMinutes(nextIntervalMinutes, 0, 0);

    return nextIntervalMark.getTime() - now.getTime();
}
