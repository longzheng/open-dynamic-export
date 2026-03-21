import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventEmitter from 'events';

// Mock mqtt module
const mockClient = new EventEmitter() as EventEmitter & {
    subscribe: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
};
mockClient.subscribe = vi.fn();
mockClient.end = vi.fn();

vi.mock('mqtt', () => ({
    default: {
        connect: vi.fn(() => mockClient),
    },
}));

vi.mock('../../helpers/logger', () => ({
    pinoLogger: {
        child: vi.fn(() => ({
            error: vi.fn(),
            warn: vi.fn(),
        })),
    },
}));

vi.mock('../../helpers/influxdb', () => ({
    writeControlLimit: vi.fn(),
}));

import { MqttSetpoint } from './index.js';

function createSetpoint(stalenessTimeoutSeconds?: number) {
    return new MqttSetpoint({
        config: {
            host: 'mqtt://localhost',
            topic: 'test/topic',
            stalenessTimeoutSeconds,
        },
    });
}

function simulateMessage(message: Record<string, unknown>) {
    mockClient.emit('message', 'test/topic', Buffer.from(JSON.stringify(message)));
}

describe('MqttSetpoint staleness timeout', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        mockClient.removeAllListeners('message');
        mockClient.removeAllListeners('connect');
    });

    it('should return cached message values when fresh', () => {
        const setpoint = createSetpoint(300);

        simulateMessage({
            batteryGridChargingEnabled: true,
            batteryGridChargingMaxWatts: 3000,
        });

        const limit = setpoint.getInverterControlLimit();

        expect(limit.batteryGridChargingEnabled).toBe(true);
        expect(limit.batteryGridChargingMaxWatts).toBe(3000);
    });

    it('should discard cached message after staleness timeout', () => {
        const setpoint = createSetpoint(300); // 5 minute timeout

        simulateMessage({
            batteryGridChargingEnabled: true,
            batteryGridChargingMaxWatts: 3000,
            opModExpLimW: 5000,
        });

        // Fresh — values should be present
        const freshLimit = setpoint.getInverterControlLimit();
        expect(freshLimit.batteryGridChargingEnabled).toBe(true);
        expect(freshLimit.opModExpLimW).toBe(5000);

        // Advance past timeout
        vi.advanceTimersByTime(301 * 1000);

        // Stale — all values should be undefined
        const staleLimit = setpoint.getInverterControlLimit();
        expect(staleLimit.batteryGridChargingEnabled).toBeUndefined();
        expect(staleLimit.batteryGridChargingMaxWatts).toBeUndefined();
        expect(staleLimit.opModExpLimW).toBeUndefined();
        expect(staleLimit.source).toBe('mqtt');
    });

    it('should refresh staleness timer on new message', () => {
        const setpoint = createSetpoint(300);

        simulateMessage({ batteryGridChargingEnabled: true });

        // Advance 200 seconds (within timeout)
        vi.advanceTimersByTime(200 * 1000);

        // New message refreshes the timer
        simulateMessage({ batteryGridChargingEnabled: true });

        // Advance another 200 seconds (400 total, but only 200 since last message)
        vi.advanceTimersByTime(200 * 1000);

        // Should still be fresh
        const limit = setpoint.getInverterControlLimit();
        expect(limit.batteryGridChargingEnabled).toBe(true);
    });

    it('should persist messages indefinitely when no timeout configured', () => {
        const setpoint = createSetpoint(undefined);

        simulateMessage({
            batteryGridChargingEnabled: true,
            batteryGridChargingMaxWatts: 3000,
        });

        // Advance a very long time
        vi.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours

        // Should still have values (backwards compatible)
        const limit = setpoint.getInverterControlLimit();
        expect(limit.batteryGridChargingEnabled).toBe(true);
        expect(limit.batteryGridChargingMaxWatts).toBe(3000);
    });

    it('should return undefined values when no message received', () => {
        const setpoint = createSetpoint(300);

        const limit = setpoint.getInverterControlLimit();

        expect(limit.batteryGridChargingEnabled).toBeUndefined();
        expect(limit.opModExpLimW).toBeUndefined();
        expect(limit.source).toBe('mqtt');
    });

    it('should recover when a new message arrives after staleness', () => {
        const setpoint = createSetpoint(300);

        simulateMessage({ batteryGridChargingEnabled: true });

        // Go stale
        vi.advanceTimersByTime(301 * 1000);
        expect(
            setpoint.getInverterControlLimit().batteryGridChargingEnabled,
        ).toBeUndefined();

        // New message arrives
        simulateMessage({ batteryGridChargingEnabled: false });

        // Should have the new value
        const limit = setpoint.getInverterControlLimit();
        expect(limit.batteryGridChargingEnabled).toBe(false);
    });
});
