type Reading = {
    timestamp: Date;
    value: number;
};

export function timeWeightedAverage(readings: Reading[]): number {
    if (readings.length === 0) {
        return NaN; // Undefined average
    }

    // Sort readings by timestamp in ascending order
    const sortedReadings = readings
        .slice()
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let weightedSum = 0;
    let totalDuration = 0;

    for (let i = 0; i < sortedReadings.length - 1; i++) {
        const current = sortedReadings[i]!;
        const next = sortedReadings[i + 1]!;

        const currentTime = current.timestamp.getTime();
        const nextTime = next.timestamp.getTime();

        // Calculate duration in milliseconds
        const duration = nextTime - currentTime;

        if (duration < 0) {
            throw new Error(
                'Readings must be sorted in ascending order of timestamps.',
            );
        }

        // Convert duration to desired units, e.g., seconds
        const durationSeconds = duration / 1000;

        weightedSum += current.value * durationSeconds;
        totalDuration += durationSeconds;
    }

    // Handle the last reading
    const lastReading = sortedReadings[sortedReadings.length - 1]!;
    const lastTimestamp = lastReading.timestamp.getTime();
    const finalEndTime = Date.now();

    const lastDuration = finalEndTime - lastTimestamp;

    if (lastDuration < 0) {
        throw new Error("End time must be after the last reading's timestamp.");
    }

    const lastDurationSeconds = lastDuration / 1000;

    weightedSum += lastReading.value * lastDurationSeconds;
    totalDuration += lastDurationSeconds;

    if (totalDuration === 0) {
        return lastReading.value;
    }

    return weightedSum / totalDuration;
}
