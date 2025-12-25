import { describe, it, expect } from 'vitest';
import { configSchema } from './config.js';

describe('Config Validation - Battery Control Conflicts', () => {
    const createValidBaseConfig = () => ({
        setpoints: {},
        inverters: [
            {
                type: 'sunspec' as const,
                connection: {
                    type: 'tcp' as const,
                    ip: '192.168.1.10',
                    port: 502,
                },
                unitId: 1,
                pollingIntervalMs: 1000,
            },
        ],
        inverterControl: {
            enabled: true,
            batteryControlEnabled: false,
            batteryPowerFlowControl: false,
        },
        meter: {
            type: 'sunspec' as const,
            connection: {
                type: 'tcp' as const,
                ip: '192.168.1.20',
                port: 502,
            },
            unitId: 240,
            location: 'feedin' as const,
        },
    });

    it('should accept configuration with only legacy battery charge buffer', () => {
        const config = {
            ...createValidBaseConfig(),
            battery: {
                chargeBufferWatts: 1000,
            },
        };

        expect(() => configSchema.parse(config)).not.toThrow();
    });

    it('should accept configuration with only new battery power flow control', () => {
        const config = {
            ...createValidBaseConfig(),
            inverterControl: {
                ...createValidBaseConfig().inverterControl,
                batteryControlEnabled: true,
                batteryPowerFlowControl: true,
            },
            inverters: [
                {
                    ...createValidBaseConfig().inverters[0],
                    batteryControlEnabled: true,
                },
            ],
        };

        expect(() => configSchema.parse(config)).not.toThrow();
    });

    it('should accept configuration with neither battery control method', () => {
        const config = createValidBaseConfig();

        expect(() => configSchema.parse(config)).not.toThrow();
    });

    it('should reject configuration with both legacy charge buffer and new power flow control', () => {
        const config = {
            ...createValidBaseConfig(),
            inverterControl: {
                ...createValidBaseConfig().inverterControl,
                batteryControlEnabled: true,
                batteryPowerFlowControl: true, // NEW method enabled
            },
            battery: {
                chargeBufferWatts: 1000, // LEGACY method enabled
            },
        };

        expect(() => configSchema.parse(config)).toThrow(
            /Cannot use both legacy battery\.chargeBufferWatts and new inverterControl\.batteryPowerFlowControl/,
        );
    });

    it('should provide helpful error message when both methods are configured', () => {
        const config = {
            ...createValidBaseConfig(),
            inverterControl: {
                ...createValidBaseConfig().inverterControl,
                batteryControlEnabled: true,
                batteryPowerFlowControl: true,
            },
            battery: {
                chargeBufferWatts: 1000,
            },
        };

        try {
            configSchema.parse(config);
            expect.fail('Should have thrown validation error');
        } catch (error: unknown) {
            const errorMessage = (error as Error).message;
            expect(errorMessage).toContain('legacy battery.chargeBufferWatts');
            expect(errorMessage).toContain(
                'inverterControl.batteryPowerFlowControl',
            );
            expect(errorMessage).toContain('only one battery control method');
        }
    });

    it('should allow legacy charge buffer when batteryPowerFlowControl is explicitly false', () => {
        const config = {
            ...createValidBaseConfig(),
            inverterControl: {
                ...createValidBaseConfig().inverterControl,
                batteryPowerFlowControl: false, // Explicitly disabled
            },
            battery: {
                chargeBufferWatts: 1000,
            },
        };

        expect(() => configSchema.parse(config)).not.toThrow();
    });

    it('should allow legacy charge buffer when batteryPowerFlowControl is undefined (default)', () => {
        const baseConfig = createValidBaseConfig();
        const config = {
            ...baseConfig,
            inverterControl: {
                enabled: true,
                batteryControlEnabled: false,
                // batteryPowerFlowControl not specified (defaults to false)
            },
            battery: {
                chargeBufferWatts: 1000,
            },
        };

        expect(() => configSchema.parse(config)).not.toThrow();
    });
});
