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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            // Importing 8000W but limited to 4000W discharge
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-4000);
        });

        it('should not curtail PV during self-consumption discharge with export blocked', () => {
            // Regression: when negativeFeedIn (or any setpoint) sets exportLimit=0
            // AND the battery is discharging to cover load, PV must NOT be curtailed
            // below the system's true load — otherwise PV stays light-throttled,
            // battery permanently fills the gap, and the system settles into a
            // bistable "burn battery cycles while cheap import is available"
            // equilibrium. Two coupled defects had to be fixed:
            //
            // 1. Coupling discharge into the PV target via measured battery
            //    (previous formula: targetSolar = load + currentBattery + export
            //    became targetSolar = load - |discharge|, ~4% power ratio).
            //
            // 2. loadWatts under-reporting on hybrid inverters: solarWatts is
            //    PV-only, so load = solarWatts + siteWatts - dischargeAC. Without
            //    the discharge correction, load was reported as 910 (when the
            //    real load was 1330), targetSolar was 910, PV stuck at 910, and
            //    the battery had to keep covering 420W indefinitely.
            //
            // User's exact logged scenario (cloudy):
            //   PV=470, siteWatts=+440 (importing), currentBattery=-420 (discharging).
            //   True load (energy balance): 470 + 440 + 420 = 1330 W.
            //   Old loadWatts: 470 + 440 = 910 (under by 420 = the discharge).
            //   Corrected loadWatts: 470 + 440 - min(-420, 0) = 1330 ✓
            const input: BatteryPowerFlowInput = {
                solarWatts: 470,
                siteWatts: 440, // Importing 440W
                batterySocPercent: 90,
                batteryTargetSocPercent: 100,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 0, // Export blocked by negativeFeedIn (or fixed setpoint)
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: -420, // Already discharging
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            // Battery still covers self-consumption — that behaviour is unchanged
            expect(result.batteryMode).toBe('discharge');
            // selfConsumptionDischarge = max(0, -availablePower) = max(0, 860) = 860
            //   (availablePower = -siteWatts + currentBattery = -440 + (-420) = -860)
            expect(result.targetBatteryPowerWatts).toBe(-860);
            // PV target = trueLoad (1330) + max(0, -860) + exportLimit (0) = 1330.
            // Both the discharge-coupling and loadWatts under-reporting are fixed.
            expect(result.targetSolarWatts).toBe(1330);
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: undefined,
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
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
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: undefined,
                batteryGridChargingMaxWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // undefined treated as disabled — normal discharge
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-3000);
        });
    });

    describe('deadband', () => {
        it('should snap small charge to idle', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: -30, // Exporting 30W — small excess
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should snap small discharge to idle', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 30, // Importing 30W — small deficit
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should not apply deadband when charge power is above threshold', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: -100, // Exporting 100W — above 50W deadband
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(100);
        });

        it('should not apply deadband when discharge power is above threshold', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 100, // Importing 100W — above 50W deadband
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-100);
        });
    });

    describe('battery export target', () => {
        it('should discharge battery to export when importing (deficit + export target)', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing 3000W (load = 5000W)
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 2000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = -3000, exportTarget = 2000
            // Discharge needed = 2000 - (-3000) = 5000W (cover 3000 deficit + 2000 export)
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-5000);
            expect(result.targetExportWatts).toBe(2000);
        });

        it('should discharge battery to export when grid is balanced (no solar surplus)', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 500,
                siteWatts: 0, // Balanced
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 2000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = 0, exportTarget = 2000
            // Discharge needed = 2000 - 0 = 2000W
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-2000);
            expect(result.targetExportWatts).toBe(2000);
        });

        it('should discharge partially when solar covers some of the export target', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: -1000, // Exporting 1000W surplus (load = 4000W)
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = 1000 surplus, exportTarget = 3000
            // Gap-filling: batteryExportNeeded = max(0, 3000 - 1000) = 2000
            // exportHeadroom = max(0, 5000 - 1000) = 4000
            // effectiveExportTarget = min(2000, 4000) = 2000
            // Self-consumption discharge = 0
            // Total discharge = 2000W
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-2000);
            expect(result.targetExportWatts).toBe(2000);
        });

        it('should not discharge when solar surplus already covers export target (gap-filling)', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 10000,
                siteWatts: -8000, // Exporting 8000W surplus
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 10000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = 8000 surplus, exportTarget = 3000
            // Gap-filling: batteryExportNeeded = max(0, 3000 - 8000) = 0
            // PV surplus already exceeds the export target — battery idles,
            // but PV surplus still exports up to the export limit
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            expect(result.targetExportWatts).toBe(8000);
        });

        it('should cap discharge at batteryDischargeMaxWatts', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 1000, // Importing 1000W
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 2000, // Limited
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = -1000, exportTarget = 3000
            // Discharge needed = 3000 - (-1000) = 4000, capped at 2000
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-2000);
        });

        it('should cap targetExportWatts at exportLimitWatts', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 500, // Importing 500W
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 10000,
                exportLimitWatts: 2000, // Export limit lower than target
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            expect(result.batteryMode).toBe('discharge');
            expect(result.targetExportWatts).toBe(2000);
        });

        it('should not discharge when battery at min SoC even with export target', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 500,
                batterySocPercent: 20,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20, // At min
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // Can't discharge — at min SoC
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should prefer grid charging over export target when grid charging is active', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 1000, // Importing
                batterySocPercent: 30,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
                batteryExportTargetWatts: 2000,
            };

            const result = calculateBatteryPowerFlow(input);

            // Grid charging takes priority over export target
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
        });

        it('should behave as self-consumption when export target is 0', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 3000, // Importing 3000W
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 0,
            };

            const result = calculateBatteryPowerFlow(input);

            // Same as no export target — discharge to cover imports only
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-3000);
            expect(result.targetExportWatts).toBe(0);
        });

        it('should not curtail solar when battery transitions from charge to discharge', () => {
            // Scenario: battery is currently charging at 2000W from surplus PV.
            // An export target of 4000W arrives (e.g. via MQTT).
            // With gap-filling, battery needs to discharge (4000 - 1000 PV surplus = 3000W).
            // targetSolarWatts must remain large enough that the inverter is not curtailed
            // during the charge→discharge transition — well above any reasonable nameplate.
            const input: BatteryPowerFlowInput = {
                solarWatts: 4000,
                siteWatts: -1000, // Exporting 1000W (load=3000, PV=4000, battery charging=2000 internal)
                batterySocPercent: 50,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 10000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 10000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                // Battery is CURRENTLY charging at 2000W (measured from previous cycle)
                currentBatteryPowerWatts: 2000,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 4000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = -(-1000) + 2000 = 3000
            // pvSurplus = 3000
            // Gap-filling: batteryExportNeeded = max(0, 4000 - 3000) = 1000
            // exportHeadroom = max(0, 10000 - 3000) = 7000
            // effectiveExportTarget = min(1000, 7000) = 1000
            // selfConsumptionDischarge = 0
            // batteryDischargeNeeded = 1000
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-1000);
            expect(result.targetExportWatts).toBe(1000);

            // targetSolar uses commanded charge headroom (max(0, target) = 0 since target is
            // a discharge), NOT subtracting the discharge.
            // targetSolar = load(4000 + (-1000)) + max(0, -1000) + exportLimit(10000) = 13000
            // 13000 is well above any realistic battery-inverter nameplate, so the ratio
            // still caps at 1.0 — no curtailment during the transition.
            expect(result.targetSolarWatts).toBe(13000);
        });
    });

    describe('DOE compliance', () => {
        it('should cap battery export at DOE headroom when PV partially covers target', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 4000,
                siteWatts: -1000, // 1000W PV surplus (load=3000)
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 3000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            // availablePower = 1000, pvSurplus = 1000
            // batteryExportNeeded = max(0, 5000 - 1000) = 4000
            // exportHeadroom = max(0, 3000 - 1000) = 2000
            // effectiveExportTarget = min(4000, 2000) = 2000
            // Total site export = PV 1000 + battery 2000 = 3000 = exportLimit ✓
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-2000);
            expect(result.targetExportWatts).toBe(2000);
        });

        it('should suppress battery export entirely when export limit is zero', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 500, // Importing 500W
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 0,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // exportLimitWatts = 0 → exportHeadroom = 0 → effectiveExportTarget = 0
            // Only self-consumption: discharge 500W to cover house import
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-500);
            expect(result.targetExportWatts).toBe(0);
        });

        it('should allow self-consumption discharge even with zero export limit', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 2000, // Importing 2000W
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 0,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 0,
            };

            const result = calculateBatteryPowerFlow(input);

            // No export target, just self-consumption: cover 2000W import
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-2000);
            expect(result.targetExportWatts).toBe(0);
        });

        it('should cap grid charging at import limit headroom', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 3000, // House importing 3000W
                batterySocPercent: 30,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: 6000,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            // currentImport = 3000, importHeadroom = 6000 - 3000 = 3000
            // gridChargePower = min(5000, 5000, 5000, 3000) = 3000
            expect(result.batteryMode).toBe('charge');
            expect(result.targetBatteryPowerWatts).toBe(3000);
        });

        it('should prevent grid charging when already at import limit', () => {
            const input: BatteryPowerFlowInput = {
                solarWatts: 0,
                siteWatts: 6000, // Already at import limit
                batterySocPercent: 30,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: 6000,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            // currentImport = 6000, importHeadroom = 6000 - 6000 = 0
            // gridChargePower = min(..., 0) = 0 → deadband → idle
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should gap-fill when PV partially covers export target with tight DOE limit', () => {
            // PV exports 1000W, target is 5000W, DOE limit is 3000W
            // Battery should fill up to DOE headroom (2000W), not the full gap (4000W)
            const input: BatteryPowerFlowInput = {
                solarWatts: 3000,
                siteWatts: -1000, // Exporting 1000W (load=2000)
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 3000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: undefined,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            // pvSurplus = 1000, batteryExportNeeded = max(0, 5000-1000) = 4000
            // exportHeadroom = max(0, 3000-1000) = 2000
            // effectiveExportTarget = min(4000, 2000) = 2000
            // Total site export = PV 1000 + battery 2000 = 3000 = DOE limit ✓
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-2000);
            expect(result.targetExportWatts).toBe(2000);
        });
    });

    describe('hybrid inverter PV-loss check', () => {
        it('should discharge when export gain exceeds hybrid PV loss', () => {
            // PLUS PV=2770, NONPLUS PV=2833, load=1100, export target=15000
            // Site: solarWatts=5603, siteWatts=-4503 (exporting)
            const input: BatteryPowerFlowInput = {
                solarWatts: 5603,
                siteWatts: -4503,
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 8500,
                exportLimitWatts: 20000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: 2770,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 15000,
            };

            const result = calculateBatteryPowerFlow(input);

            // pvSurplus = 4503, batteryExportNeeded = max(0, 15000 - 4503) = 10497
            // hybridPvLoss = 2770, 10497 > 2770 → net positive, discharge allowed
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBeLessThan(0);
            expect(result.targetExportWatts).toBeGreaterThan(0);
        });

        it('should not discharge when gap-filling already says PV covers target', () => {
            // Both inverters generating well, target fully covered by PV
            // PLUS PV=3000, NONPLUS PV=3000, load=1000, export target=5000
            const input: BatteryPowerFlowInput = {
                solarWatts: 6000,
                siteWatts: -5000, // exporting 5000W
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 8500,
                exportLimitWatts: 20000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: 3000,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 5000,
            };

            const result = calculateBatteryPowerFlow(input);

            // pvSurplus = 5000, batteryExportNeeded = max(0, 5000 - 5000) = 0
            // Gap-filling already prevents discharge, PV-loss check not needed
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
        });

        it('should skip discharge when hybrid PV loss exceeds export gain', () => {
            // PLUS PV=4000, NONPLUS PV=1000, load=1000, export target=6000
            // Discharging 2kW would lose 4kW PLUS PV = net -2kW loss
            const input: BatteryPowerFlowInput = {
                solarWatts: 5000,
                siteWatts: -4000, // exporting 4000W
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 8500,
                exportLimitWatts: 20000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: 4000,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 6000,
            };

            const result = calculateBatteryPowerFlow(input);

            // pvSurplus = 4000, batteryExportNeeded = max(0, 6000 - 4000) = 2000
            // hybridPvLoss = 4000, 2000 > 4000 → false, discharge is net loss
            // System exports 4kW PV-only instead of worse 3kW (2kW bat + 1kW nonplus)
            expect(result.batteryMode).toBe('idle');
            expect(result.targetBatteryPowerWatts).toBe(0);
            // targetExportWatts reflects PV export (falls through to PV surplus path)
            expect(result.targetExportWatts).toBe(4000);
        });

        it('should still discharge for self-consumption even when hybrid PV loss blocks export', () => {
            // No PV surplus, house importing, export target blocked by PV-loss check
            // Battery should still cover house load (self-consumption)
            const input: BatteryPowerFlowInput = {
                solarWatts: 1000,
                siteWatts: 2000, // importing 2000W
                batterySocPercent: 80,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 8500,
                exportLimitWatts: 20000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: 1000,
                batteryPriorityMode: 'export_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 3000,
            };

            const result = calculateBatteryPowerFlow(input);

            // pvSurplus = 0 (importing), batteryExportNeeded = max(0, 3000 - 0) = 3000
            // hybridPvLoss = 1000, 3000 > 1000 → true, export allowed
            // selfConsumptionDischarge = 2000
            // batteryDischargeNeeded = 3000 + 2000 = 5000
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-5000);
        });

        it('should allow self-consumption discharge with zero export target and hybrid PV', () => {
            // No export target, just self-consumption — PV-loss check should not block
            const input: BatteryPowerFlowInput = {
                solarWatts: 2000,
                siteWatts: 1000, // importing 1000W (load > PV)
                batterySocPercent: 60,
                batteryTargetSocPercent: 80,
                batterySocMinPercent: 20,
                batterySocMaxPercent: 100,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 5000,
                exportLimitWatts: 5000,
                importLimitWatts: Number.MAX_SAFE_INTEGER,
                batteryInverterSolarW: 2000,
                batteryPriorityMode: 'battery_first',
                currentBatteryPowerWatts: 0,
                batteryGridChargingEnabled: false,
                batteryGridChargingMaxWatts: undefined,
                batteryExportTargetWatts: 0,
            };

            const result = calculateBatteryPowerFlow(input);

            // exportTarget = 0 → batteryExportNeeded = 0 → hybridPvLoss irrelevant
            // selfConsumptionDischarge = max(0, -(-1000 + 0)) = 1000
            expect(result.batteryMode).toBe('discharge');
            expect(result.targetBatteryPowerWatts).toBe(-1000);
            expect(result.targetExportWatts).toBe(0);
        });
    });
});
