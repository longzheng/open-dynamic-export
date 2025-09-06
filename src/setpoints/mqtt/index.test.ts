import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { type Config } from '../../helpers/config.js';

// Mock dependencies
vi.mock('../../helpers/influxdb.js', () => ({
    writeControlLimit: vi.fn(),
}));

vi.mock('../../helpers/logger.js', () => ({
    pinoLogger: {
        child: vi.fn(() => ({
            error: vi.fn(),
        })),
    },
}));

// Mock mqtt - must be defined before the dynamic import
const mockClient = {
    on: vi.fn(),
    subscribe: vi.fn(),
    end: vi.fn(),
};

vi.mock('mqtt', () => ({
    default: {
        connect: vi.fn(() => mockClient),
    },
}));

// Dynamic import after mocking
const { MqttSetpoint } = await import('./index.js');

describe('MqttSetpoint', () => {
    let mqttConfig: NonNullable<Config['setpoints']['mqtt']>;

    beforeEach(() => {
        vi.clearAllMocks();
        mqttConfig = {
            host: 'mqtt://localhost:1883',
            username: 'testuser',
            password: 'testpass',
            topic: 'test/setpoint',
        };
    });

    describe('basic functionality', () => {
        it('should create MQTT client with correct configuration', async () => {
            const mqtt = await import('mqtt');
            new MqttSetpoint({ config: mqttConfig });

            expect(mqtt.default.connect).toHaveBeenCalledWith(mqttConfig.host, {
                username: mqttConfig.username,
                password: mqttConfig.password,
            });
        });

        it('should subscribe to topic on connection', () => {
            new MqttSetpoint({ config: mqttConfig });

            // Simulate connection event
            const connectHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'connect'
            )?.[1];
            connectHandler?.();

            expect(mockClient.subscribe).toHaveBeenCalledWith(mqttConfig.topic);
        });

        it('should return empty control limit when no message received', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            const result = setpoint.getInverterControlLimit();

            expect(result).toEqual({
                source: 'mqtt',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: undefined,
                batteryImportTargetWatts: undefined,
                batteryExportTargetWatts: undefined,
                batteryChargeMaxWatts: undefined,
                batteryDischargeMaxWatts: undefined,
                batteryPriorityMode: undefined,
                batteryGridChargingEnabled: undefined,
                batteryGridChargingMaxWatts: undefined,
            });
        });
    });

    describe('message processing', () => {
        it('should process valid MQTT message with basic controls', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            // Simulate message event
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];
            
            const testMessage = {
                opModConnect: true,
                opModEnergize: false,
                opModExpLimW: 3000,
                opModGenLimW: 4000,
                opModImpLimW: 2000,
                opModLoadLimW: 1000,
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();

            expect(result.opModConnect).toBe(true);
            expect(result.opModEnergize).toBe(false);
            expect(result.opModExpLimW).toBe(3000);
            expect(result.opModGenLimW).toBe(4000);
            expect(result.opModImpLimW).toBe(2000);
            expect(result.opModLoadLimW).toBe(1000);
        });

        it('should process valid MQTT message with battery controls', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];
            
            const testMessage = {
                exportTargetWatts: 2500,
                importTargetWatts: 3000,
                batterySocTargetPercent: 85,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 95,
                batteryChargeMaxWatts: 4000,
                batteryDischargeMaxWatts: 3500,
                batteryPriorityMode: 'battery_first' as const,
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 2000,
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();

            expect(result.batteryExportTargetWatts).toBe(2500);
            expect(result.batteryImportTargetWatts).toBe(3000);
            expect(result.batteryTargetSocPercent).toBe(85);
            expect(result.batteryChargeMaxWatts).toBe(4000);
            expect(result.batteryDischargeMaxWatts).toBe(3500);
            expect(result.batteryPriorityMode).toBe('battery_first');
            expect(result.batteryGridChargingEnabled).toBe(true);
            expect(result.batteryGridChargingMaxWatts).toBe(2000);
        });

        it('should handle export_first priority mode', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];
            
            const testMessage = {
                batteryPriorityMode: 'export_first' as const,
                batterySocTargetPercent: 30,
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();

            expect(result.batteryPriorityMode).toBe('export_first');
            expect(result.batteryTargetSocPercent).toBe(30);
        });

        it('should handle disabled grid charging', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];
            
            const testMessage = {
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: 0,
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();

            expect(result.batteryGridChargingEnabled).toBe(false);
            expect(result.batteryGridChargingMaxWatts).toBe(0);
        });
    });

    describe('message validation', () => {
        it('should handle JSON parse errors gracefully', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];

            // The current implementation doesn't handle JSON.parse errors
            // This test documents the current behavior - it will throw
            expect(() => {
                messageHandler?.(
                    'test/setpoint', 
                    Buffer.from('invalid json')
                );
            }).toThrow('Unexpected token');

            const result = setpoint.getInverterControlLimit();
            // Should return default values since no valid message was processed
            expect(result.batteryTargetSocPercent).toBeUndefined();
        });

        it('should reject invalid battery SOC values', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];

            const testMessage = {
                batterySocTargetPercent: 150, // Invalid: > 100
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();
            // Should return default values since validation failed
            expect(result.batteryTargetSocPercent).toBeUndefined();
        });

        it('should reject negative power values', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];

            const testMessage = {
                exportTargetWatts: -100, // Invalid: negative
                importTargetWatts: -50,  // Invalid: negative
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();
            // Should return default values since validation failed
            expect(result.batteryExportTargetWatts).toBeUndefined();
            expect(result.batteryImportTargetWatts).toBeUndefined();
        });

        it('should accept valid boundary values', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            
            const messageHandler = mockClient.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];

            const testMessage = {
                batterySocTargetPercent: 0,   // Valid boundary
                batterySocMinPercent: 100,    // Valid boundary
                exportTargetWatts: 0,         // Valid boundary
                importTargetWatts: 0,         // Valid boundary
            };

            messageHandler?.(
                'test/setpoint', 
                Buffer.from(JSON.stringify(testMessage))
            );

            const result = setpoint.getInverterControlLimit();

            expect(result.batteryTargetSocPercent).toBe(0);
            expect(result.batteryExportTargetWatts).toBe(0);
            expect(result.batteryImportTargetWatts).toBe(0);
        });
    });

    describe('source attribution', () => {
        it('should always set source as "mqtt"', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            const result = setpoint.getInverterControlLimit();

            expect(result.source).toBe('mqtt');
        });
    });

    describe('cleanup', () => {
        it('should end MQTT client on destroy', () => {
            const setpoint = new MqttSetpoint({ config: mqttConfig });
            setpoint.destroy();

            expect(mockClient.end).toHaveBeenCalled();
        });
    });
});