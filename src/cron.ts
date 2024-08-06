export function callEveryMinutesInterval(
    callback: () => void,
    minutesInterval: number,
) {
    const intervalMillis = minutesInterval * 60 * 1000;

    // Function to calculate the delay until the next interval mark
    function getDelayToNextIntervalMark() {
        const now = new Date();
        const nextIntervalMark = new Date(now);
        const currentMinutes = now.getMinutes();
        const nextIntervalMinutes =
            Math.ceil(currentMinutes / minutesInterval) * minutesInterval;
        nextIntervalMark.setMinutes(nextIntervalMinutes, 0, 0);
        return nextIntervalMark.getTime() - now.getTime();
    }

    // Initial delay calculation
    const initialDelay = getDelayToNextIntervalMark();

    let intervalId: NodeJS.Timeout;

    // Set initial timeout
    const initialTimeoutId = setTimeout(function triggerCallback() {
        // Call the callback function
        callback();

        // Schedule subsequent calls at interval intervals
        intervalId = setInterval(callback, intervalMillis);
    }, initialDelay);

    // Return a cancel function to clear the timeout and interval
    return {
        cancel: () => {
            clearTimeout(initialTimeoutId);
            clearInterval(intervalId);
        },
    };
}
