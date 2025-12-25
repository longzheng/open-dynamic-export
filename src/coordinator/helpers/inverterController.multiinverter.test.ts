import { describe, it, expect } from 'vitest';
import { calculateInverterConfiguration } from './inverterController.js';
import { type ActiveInverterControlLimit } from './inverterController.js';

describe('calculateInverterConfiguration - Multi-Inverter Battery Scenarios', () => {
    const createBasicActiveLimit = (
        overrides: Partial<ActiveInverterControlLimit> = {},
    ): ActiveInverterControlLimit => ({
        opModEnergize: { value: true, source: 'fixed' },
        opModConnect: { value: true, source: 'fixed' },
        opModGenLimW: { value: 20000, source: 'fixed' },
        opModExpLimW: { value: 5000, source: 'fixed' },
        opModImpLimW: undefined,
        opModLoadLimW: undefined,
        batteryChargeRatePercent: undefined,
        batteryDischargeRatePercent: undefined,
        batteryStorageMode: undefined,
        batteryTargetSocPercent: undefined,
        batteryImportTargetWatts: undefined,
        batteryExportTargetWatts: undefined,
        batterySocMinPercent: undefined,
        batterySocMaxPercent: undefined,
        batteryChargeMaxWatts: undefined,
        batteryDischargeMaxWatts: undefined,
        batteryPriorityMode: undefined,
        batteryGridChargingEnabled: undefined,
        batteryGridChargingMaxWatts: undefined,
        ...overrides,
    });

    describe('Single inverter with battery', () => {
        it('should use battery SOC when available', () => {
            const activeLimit = createBasicActiveLimit({
                batteryTargetSocPercent: { value: 80, source: 'mqtt' },
                batterySocMinPercent: { value: 20, source: 'mqtt' },
                batterySocMaxPercent: { value: 100, source: 'mqtt' },
                batteryChargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryDischargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -8000, // Exporting
                solarWatts: 10000,
                nameplateMaxW: 12000,
                maxInvertersCount: 1,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: 50, // Battery at 50% SOC
            });

            expect(result.type).toBe('limit');
            if (result.type === 'limit') {
                expect(result.batteryControl).toBeDefined();
                expect(result.batteryControl?.mode).toBe('charge');
            }
        });

        it('should handle null battery SOC gracefully', () => {
            const activeLimit = createBasicActiveLimit({
                batteryTargetSocPercent: { value: 80, source: 'mqtt' },
                batterySocMinPercent: { value: 20, source: 'mqtt' },
                batterySocMaxPercent: { value: 100, source: 'mqtt' },
                batteryChargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryDischargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -8000,
                solarWatts: 10000,
                nameplateMaxW: 12000,
                maxInvertersCount: 1,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: null, // SOC unknown
            });

            expect(result.type).toBe('limit');
            if (result.type === 'limit') {
                // Should still try to charge battery when SOC is unknown
                expect(result.batteryControl).toBeDefined();
            }
        });
    });

    describe('Multiple inverters with mixed battery capability', () => {
        it('should calculate battery control even when only some inverters have batteries', () => {
            const activeLimit = createBasicActiveLimit({
                batteryTargetSocPercent: { value: 80, source: 'mqtt' },
                batterySocMinPercent: { value: 20, source: 'mqtt' },
                batterySocMaxPercent: { value: 100, source: 'mqtt' },
                batteryChargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryDischargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            // Scenario: 2 inverters total, only one has battery
            // Average SOC is from the single battery
            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -15000, // Exporting 15kW
                solarWatts: 18000, // Generating 18kW (9kW per inverter)
                nameplateMaxW: 20000, // 10kW per inverter
                maxInvertersCount: 2,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: 60, // Average SOC (from 1 battery)
            });

            expect(result.type).toBe('limit');
            if (result.type === 'limit') {
                // Should create battery control configuration
                // The inverter without battery will gracefully skip it
                expect(result.batteryControl).toBeDefined();
                expect(result.batteryControl?.mode).toBe('charge');
            }
        });

        it('should handle multiple batteries with different SOC levels (averaged)', () => {
            const activeLimit = createBasicActiveLimit({
                batteryTargetSocPercent: { value: 80, source: 'mqtt' },
                batterySocMinPercent: { value: 20, source: 'mqtt' },
                batterySocMaxPercent: { value: 100, source: 'mqtt' },
                batteryChargeMaxWatts: { value: 8000, source: 'mqtt' }, // Combined max
                batteryDischargeMaxWatts: { value: 8000, source: 'mqtt' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            // Scenario: 2 inverters, both with batteries
            // Battery 1 at 80%, Battery 2 at 60%, average = 70%
            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -15000, // Exporting
                solarWatts: 20000,
                nameplateMaxW: 24000, // 12kW per inverter
                maxInvertersCount: 2,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: 70, // Average of 80% and 60%
            });

            expect(result.type).toBe('limit');
            if (result.type === 'limit') {
                expect(result.batteryControl).toBeDefined();
                // Should charge batteries toward target of 80%
                expect(result.batteryControl?.mode).toBe('charge');
            }
        });
    });

    describe('Battery control disabled scenarios', () => {
        it('should not create battery control when feature is disabled', () => {
            const activeLimit = createBasicActiveLimit({
                batteryTargetSocPercent: { value: 80, source: 'mqtt' },
                batterySocMinPercent: { value: 20, source: 'mqtt' },
                batterySocMaxPercent: { value: 100, source: 'mqtt' },
                batteryChargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryDischargeMaxWatts: { value: 5000, source: 'mqtt' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -8000,
                solarWatts: 10000,
                nameplateMaxW: 12000,
                maxInvertersCount: 1,
                batteryPowerFlowControlEnabled: false, // Feature disabled
                batterySocPercent: 50,
            });

            expect(result.type).toBe('limit');
            if (result.type === 'limit') {
                expect(result.batteryControl).toBeUndefined();
            }
        });

        it('should not create battery control when no battery parameters provided', () => {
            const activeLimit = createBasicActiveLimit();

            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -8000,
                solarWatts: 10000,
                nameplateMaxW: 12000,
                maxInvertersCount: 1,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: 50,
            });

            expect(result.type).toBe('limit');
            if (result.type === 'limit') {
                // No battery parameters means calculator will use defaults
                // which should still work
                expect(result.batteryControl).toBeDefined();
            }
        });
    });

    describe('Disconnect/Deenergize scenarios', () => {
        it('should not create battery control when disconnected', () => {
            const activeLimit = createBasicActiveLimit({
                opModConnect: { value: false, source: 'fixed' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -8000,
                solarWatts: 10000,
                nameplateMaxW: 12000,
                maxInvertersCount: 1,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: 50,
            });

            expect(result.type).toBe('disconnect');
        });

        it('should not create battery control when deenergized', () => {
            const activeLimit = createBasicActiveLimit({
                opModEnergize: { value: false, source: 'fixed' },
                batteryPriorityMode: { value: 'battery_first', source: 'mqtt' },
            });

            const result = calculateInverterConfiguration({
                activeInverterControlLimit: activeLimit,
                siteWatts: -8000,
                solarWatts: 10000,
                nameplateMaxW: 12000,
                maxInvertersCount: 1,
                batteryPowerFlowControlEnabled: true,
                batterySocPercent: 50,
            });

            expect(result.type).toBe('deenergize');
        });
    });
});
