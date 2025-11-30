import { describe, it, expect } from 'vitest';
import {
    calculateBatteryPowerFlow,
    type BatteryPowerFlowInput,
} from './batteryPowerFlowCalculator.js';

describe('calculateBatteryPowerFlow', () => {
    describe('battery_first mode', () => {
        it('should charge battery before exporting when excess solar available', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000, // Exporting 8000W
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Available power = 8000W
            // Battery gets 5000W (its max charge rate)
            // Export gets remaining 3000W
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(5000);
            expect(result.targetExportWatts).toBe(3000);
        });

        it('should export remainder after battery is full', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 100, // Battery full
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Battery is full, can't charge
            // Export up to limit (5000W)
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(5000);
        });

        it('should curtail solar when export limit is restrictive', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 15000,
                siteWatts: -13000, // Exporting 13000W (load = 2000W)
                batterySocPercent: 100, // Battery full
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Available = 13000W
            // Battery full, can't charge
            // Export limited to 5000W
            // Target solar = load + battery + export = 2000 + 0 + 5000 = 7000W
            expect(result.targetExportWatts).toBe(5000);
            expect(result.targetSolarWatts).toBe(7000);
        });

        it('should charge battery with all available power when export limit allows', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 8000,
                siteWatts: -6000,
                batterySocPercent: 40,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 10000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 10000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Available = 6000W
            // Battery can take all 6000W (under its 10000W limit)
            // Export gets 0W
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(6000);
            expect(result.targetExportWatts).toBe(0);
        });
    });

    describe('export_first mode', () => {
        it('should export before charging battery when excess solar available', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'export_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Available = 8000W
            // Export gets 5000W (its limit)
            // Battery gets remaining 3000W
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
            expect(result.targetExportWatts).toBe(5000);
        });

        it('should export all available power when battery is full', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 100,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 10000,
                batteryPriorityMode: 'export_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Battery full
            // Export all available 8000W
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(8000);
        });

        it('should charge battery with remaining power after export', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 10000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 3000,
                batteryPriorityMode: 'export_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Available = 8000W
            // Export 3000W (limit)
            // Battery gets 5000W (remaining)
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(5000);
            expect(result.targetExportWatts).toBe(3000);
        });
    });

    describe('SOC constraints', () => {
        it('should not charge when battery is at max SOC', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 95,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 95, // At max
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 10000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(8000);
        });

        it('should not discharge when battery is at min SOC', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 1000,
                siteWatts: 2000, // Importing 2000W
                batterySocPercent: 20,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20, // At min
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Can't discharge, at min SOC
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should handle unknown SOC gracefully', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: null, // Unknown SOC
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Should assume battery can charge when SOC unknown
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(5000);
        });
    });

    describe('battery discharge', () => {
        it('should discharge battery when importing power', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing 3000W (load = 5000W)
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Importing 3000W
            // Discharge battery up to 3000W (under max discharge limit)
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-3000);
        });

        it('should limit discharge to max discharge watts', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 1000,
                siteWatts: 8000, // Importing 8000W
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 4000, // Limited to 4000W
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Importing 8000W but limited to 4000W discharge
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-4000);
        });
    });

    describe('no available power scenarios', () => {
        it('should not charge or export when consuming all solar', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: 0, // Balanced - no import/export
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(0);
        });
    });

    describe('default values', () => {
        it('should default to battery_first when priority mode not specified', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: undefined,
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Should behave as battery_first
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(5000);
            expect(result.targetExportWatts).toBe(3000);
        });

        it('should handle undefined battery limits', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: 50,
                batteryTargetSocPercent: undefined,
                batterySocMinPercent: undefined,
                batterySocMaxPercent: undefined,
                batteryChargeMaxWatts: undefined,
                batteryDischargeMaxWatts: undefined,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
            };

            const result = calculateBatteryPowerFlow(input);

            // Should use defaults (0-100% SOC, unlimited charge power)
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBeGreaterThan(0);
        });
    });
});
