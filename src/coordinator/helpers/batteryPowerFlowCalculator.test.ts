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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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

    describe('SoC constraints', () => {
        it('should not charge when battery is at max SoC', () => {
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
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(8000);
        });

        it('should not discharge when battery is at min SoC', () => {
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
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            // Can't discharge, at min SoC
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should handle unknown SoC gracefully', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000,
                batterySocPercent: null, // Unknown SoC
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            // Should assume battery can charge when SoC unknown
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(0);
        });
    });

    describe('unlimited export should not curtail solar', () => {
        it('should allow full solar production when export is unlimited and battery is idle', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 1700,
                siteWatts: -1400, // Exporting 1400W (load = 300W)
                batterySocPercent: 93,
                batteryTargetSocPercent: 80, // Above target — battery idle
                batterySocMinPercent: 20,
                batterySocMaxPercent: 95,
                batteryChargeMaxWatts: undefined,
                batteryDischargeMaxWatts: undefined,
                exportLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            // targetSolarWatts must be much larger than current solarWatts
            // so the power ratio → 1.0, allowing the inverter to ramp up
            expect(result.targetSolarWatts).toBeGreaterThan(input.solarWatts);
            expect(result.targetSolarWatts).toBeGreaterThan(100000);
        });

        it('should allow full solar production when export is unlimited and battery is charging', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: -3000, // Exporting 3000W (load = 2000W)
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
            // With unlimited export, inverter should not be curtailed
            expect(result.targetSolarWatts).toBeGreaterThan(input.solarWatts);
            expect(result.targetSolarWatts).toBeGreaterThan(100000);
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
                batteryGridChargingMaxWatts: undefined,
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
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            // Should use defaults (0-100% SoC, unlimited charge power)
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBeGreaterThan(0);
        });
    });

    describe('grid charging', () => {
        it('should charge battery from grid when importing and battery below target', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing 3000W
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
            expect(result.targetExportWatts).toBe(0);
        });

        it('should cap grid charging at batteryGridChargingMaxWatts', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 5000, // Importing 5000W
                batterySocPercent: 30,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 2000,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(2000);
        });

        it('should cap grid charging at batteryChargeMaxWatts when lower than grid max', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 5000,
                batterySocPercent: 30,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 2000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(2000);
        });

        it('should discharge normally when grid charging is disabled', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing 3000W
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-3000);
        });

        it('should idle when grid charging enabled but battery at target SoC', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing
                batterySocPercent: 80,
                batteryTargetSocPercent: 80, // At target
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // Should idle, not discharge — avoids charge/discharge oscillation
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(0);
        });

        it('should idle when grid charging enabled but battery at max SoC', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing
                batterySocPercent: 95,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 95, // At max — canCharge is false
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // Grid charging active but can't charge — idle, not discharge
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should charge from grid when power is exactly balanced', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: 0, // Balanced
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
            expect(result.targetExportWatts).toBe(0);
        });

        it('should use normal solar charging when excess solar available', () => {
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
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // Excess solar — normal battery_first behavior, grid charging irrelevant
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(5000);
            expect(result.targetExportWatts).toBe(3000);
        });

        it('should fall back to batteryChargeMaxWatts when gridChargingMaxWatts is undefined', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 5000, // Importing
                batterySocPercent: 30,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 4000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(4000);
        });

        it('should charge from grid when SoC is unknown', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 5000, // Importing
                batterySocPercent: null, // Unknown
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // Unknown SoC assumed chargeable
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
        });

        it('should discharge normally when batteryGridChargingEnabled is undefined', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: undefined,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // undefined treated as disabled — normal discharge
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-3000);
        });
    });
});
