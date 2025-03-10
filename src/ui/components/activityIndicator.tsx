import { useEffect, useState, useRef } from 'react';

export const ActivityIndicator = ({
    value,
}: {
    value: string | number | undefined;
}) => {
    const [animate, setAnimate] = useState(false);
    const isAnimatingRef = useRef(false);

    useEffect(() => {
        // Only trigger the animation if it's not already animating
        if (!isAnimatingRef.current) {
            setAnimate(true);
            isAnimatingRef.current = true;
        }
    }, [value]);

    const handleAnimationEnd = () => {
        // Reset the animation state after it ends
        setAnimate(false);
        isAnimatingRef.current = false;
    };

    return (
        <div className="relative flex size-1.5 items-center justify-center">
            {/* Permanent Dot */}
            <div className="size-full rounded-full bg-green-300" />

            {/* Glowing Pulse Overlay */}
            {animate && (
                <div
                    className="absolute inset-0 animate-pulse-glow"
                    onAnimationEnd={handleAnimationEnd}
                >
                    <div className="size-full rounded-full bg-green-300 opacity-50" />
                </div>
            )}
        </div>
    );
};
