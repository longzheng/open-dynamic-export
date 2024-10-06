export function cappedChange({
    previousValue,
    targetValue,
    maxChange,
}: {
    previousValue: number;
    targetValue: number;
    maxChange: number;
}): number {
    const delta = targetValue - previousValue;
    const direction = Math.sign(delta);

    // If delta is zero, no change is needed
    if (direction === 0) {
        return targetValue;
    }

    const limitedChange = direction * Math.min(Math.abs(delta), maxChange);

    return previousValue + limitedChange;
}
