import { describe, expect, it } from 'vitest';
import { type ActiveInverterControlLimit } from './inverterController.js';
import {
    adjustActiveInverterControlForBatteryCharging,
    calculateTargetSolarPowerRatio,
    calculateTargetSolarWatts,
    getActiveInverterControlLimit,
    getWMaxLimPctFromTargetSolarPowerRatio,
} from './inverterController.js';

// Helper to create default battery fields for testing
const defaultBatteryFields = {
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
} as const;

describe('calculateTargetSolarPowerRatio', () => {
    it('should calculate target ratio', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            nameplateMaxW: 10000,
            targetSolarWatts: 5000,
        });

        expect(targetPowerRatio).toBe(0.5);
    });

    it('should cap target power ratio above 1.0 to 1.0', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            nameplateMaxW: 10000,
            targetSolarWatts: 15000,
        });

        expect(targetPowerRatio).toBe(1);
    });

    it('should not return target power ratio lower than 0.0', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            nameplateMaxW: 10000,
            targetSolarWatts: 0,
        });

        expect(targetPowerRatio).toBe(0);
    });

    it('avoid floating point errors', () => {
        // these values don't make sense practically but is designed to test floating point errors
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            nameplateMaxW: 3,
            targetSolarWatts: 0.27,
        });

        expect(targetPowerRatio).toBe(0.09);
    });

    it('should handle nameplate as 0', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            nameplateMaxW: 0,
            targetSolarWatts: 0,
        });

        expect(targetPowerRatio).toBe(0);
    });

    it('should handle no inverters', () => {
        const targetPowerRatio = calculateTargetSolarPowerRatio({
            nameplateMaxW: 0,
            targetSolarWatts: 0,
        });

        expect(targetPowerRatio).toBe(0);
    });
});

describe('calculateTargetSolarWatts', () => {
    it('should calculate higher target if site is importing', () => {
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 2000,
            siteWatts: 5000,
            exportLimitWatts: 5000,
        });

        expect(targetSolar).toBe(12000);
    });

    it('should calculate higher target if site is exporting below export limit', () => {
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 5000,
            siteWatts: -4000,
            exportLimitWatts: 5000,
        });

        expect(targetSolar).toBe(6000);
    });

    it('should calculate lower target if site is exporting above export limit', () => {
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 8000,
            siteWatts: -7000,
            exportLimitWatts: 5000,
        });

        expect(targetSolar).toBe(6000);
    });

    it('avoid floating point errors', () => {
        // these values don't make sense practically but is designed to test floating point errors
        const targetSolar = calculateTargetSolarWatts({
            solarWatts: 8.13,
            siteWatts: -5.75,
            exportLimitWatts: 0,
        });

        expect(targetSolar).toBe(2.38);
    });
});

describe('getWMaxLimPctFromTargetSolarPowerRatio', () => {
    it('should handle WMaxLimPct_SF -2', () => {
        const WMaxLimPct = getWMaxLimPctFromTargetSolarPowerRatio({
            targetSolarPowerRatio: 1,
            controlsModel: {
                WMaxLimPct_SF: -2,
            },
        });

        expect(WMaxLimPct).toBe(10000);
    });

    it('should handle WMaxLimPct_SF 0', () => {
        const WMaxLimPct = getWMaxLimPctFromTargetSolarPowerRatio({
            targetSolarPowerRatio: 0.5,
            controlsModel: {
                WMaxLimPct_SF: 0,
            },
        });

        expect(WMaxLimPct).toBe(50);
    });

    it('should output whole values', () => {
        const WMaxLimPct = getWMaxLimPctFromTargetSolarPowerRatio({
            targetSolarPowerRatio: 0.55821249,
            controlsModel: {
                WMaxLimPct_SF: -2,
            },
        });

        expect(WMaxLimPct).toBe(5582);
    });
});

describe('getActiveInverterControlLimit', () => {
    it('should return the minimum of all limits', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: 20000,
                opModImpLimW: 10000,
                opModLoadLimW: 5000,
                ...defaultBatteryFields,
            },
            {
                source: 'mqtt',
                opModConnect: false,
                opModEnergize: true,
                opModExpLimW: 5000,
                opModGenLimW: 5000,
                opModImpLimW: 5000,
                opModLoadLimW: 5000,
                ...defaultBatteryFields,
            },
            {
                source: 'csipAus',
                opModConnect: true,
                opModEnergize: false,
                opModExpLimW: 2000,
                opModGenLimW: 10000,
                opModImpLimW: 10000,
                opModLoadLimW: 10000,
                ...defaultBatteryFields,
            },
        ]);

        expect(inverterControlLimit).toEqual({
            opModConnect: {
                source: 'mqtt',
                value: false,
            },
            opModEnergize: {
                source: 'csipAus',
                value: false,
            },
            opModExpLimW: {
                source: 'csipAus',
                value: 2000,
            },
            opModGenLimW: {
                source: 'mqtt',
                value: 5000,
            },
            opModImpLimW: {
                source: 'mqtt',
                value: 5000,
            },
            opModLoadLimW: {
                source: 'fixed',
                value: 5000,
            },
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
        } satisfies typeof inverterControlLimit);
    });

    it('should return undefined if all limits are undefined', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
            },
            {
                source: 'mqtt',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: 1000,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
            },
        ]);

        expect(inverterControlLimit).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: {
                source: 'mqtt',
                value: 1000,
            },
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
        } satisfies typeof inverterControlLimit);
    });
});

describe('adjustActiveInverterControlForBatteryCharging', () => {
    it('should return the original limit if opModExpLimW is undefined', () => {
        const activeInverterControlLimit: ActiveInverterControlLimit = {
            opModEnergize: undefined,
            opModConnect: undefined,
            opModGenLimW: undefined,
            opModExpLimW: undefined,
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
        };
        const result = adjustActiveInverterControlForBatteryCharging({
            activeInverterControlLimit,
            batteryChargeBufferWatts: 100,
        });
        expect(result.opModExpLimW?.value).toEqual(undefined);
    });

    it('should return the original limit if opModExpLimW is greater than the buffer', () => {
        const activeInverterControlLimit: ActiveInverterControlLimit = {
            opModEnergize: undefined,
            opModConnect: undefined,
            opModGenLimW: undefined,
            opModExpLimW: { source: 'fixed', value: 200 },
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
        };
        const result = adjustActiveInverterControlForBatteryCharging({
            activeInverterControlLimit,
            batteryChargeBufferWatts: 100,
        });
        expect(result.opModExpLimW?.value).toEqual(200);
    });

    it('should return the original limit if opModExpLimW is equal to the buffer', () => {
        const activeInverterControlLimit: ActiveInverterControlLimit = {
            opModEnergize: undefined,
            opModConnect: undefined,
            opModGenLimW: undefined,
            opModExpLimW: { source: 'fixed', value: 100 },
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
        };
        const result = adjustActiveInverterControlForBatteryCharging({
            activeInverterControlLimit,
            batteryChargeBufferWatts: 100,
        });
        expect(result.opModExpLimW?.value).toEqual(100);
    });

    it('should adjust the limit if opModExpLimW is less than the buffer', () => {
        const activeInverterControlLimit: ActiveInverterControlLimit = {
            opModEnergize: undefined,
            opModConnect: undefined,
            opModGenLimW: undefined,
            opModExpLimW: { source: 'batteryChargeBuffer', value: 0 },
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
        };
        const result = adjustActiveInverterControlForBatteryCharging({
            activeInverterControlLimit,
            batteryChargeBufferWatts: 100,
        });
        expect(result.opModExpLimW?.value).toBe(100);
    });

    it('should not affect the other limits', () => {
        const activeInverterControlLimit: ActiveInverterControlLimit = {
            opModEnergize: { source: 'fixed', value: true },
            opModConnect: { source: 'fixed', value: true },
            opModGenLimW: { source: 'fixed', value: 1000 },
            opModExpLimW: { source: 'fixed', value: 0 },
            opModImpLimW: { source: 'fixed', value: 1000 },
            opModLoadLimW: { source: 'fixed', value: 1000 },
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
        };
        const result = adjustActiveInverterControlForBatteryCharging({
            activeInverterControlLimit,
            batteryChargeBufferWatts: 100,
        });
        expect(result).toEqual({
            ...activeInverterControlLimit,
            opModExpLimW: { source: 'batteryChargeBuffer', value: 100 },
        });
    });
});

describe('getActiveInverterControlLimit - battery control merging', () => {
    it('should merge battery controls with most restrictive values', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: true,
                opModEnergize: true,
                opModExpLimW: 5000,
                opModGenLimW: 10000,
                opModImpLimW: 8000,
                opModLoadLimW: 6000,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: 80,
                batteryImportTargetWatts: 3000,
                batteryExportTargetWatts: 4000,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 4500,
                batteryPriorityMode: 'export_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 2500,
            },
            {
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
                batteryTargetSocPercent: 70, // More restrictive (lower)
                batteryImportTargetWatts: 2000, // More restrictive (lower)
                batteryExportTargetWatts: 3500, // More restrictive (lower)
                batteryChargeMaxWatts: 4000, // More restrictive (lower)
                batteryDischargeMaxWatts: 4000, // More restrictive (lower)
                batteryPriorityMode: 'battery_first', // Takes precedence
                batteryGridChargingEnabled: false, // More restrictive
                batteryGridChargingMaxWatts: 3000, // Less restrictive but grid charging disabled
            },
        ]);

        expect(inverterControlLimit.batteryTargetSocPercent?.value).toBe(70);
        expect(inverterControlLimit.batteryTargetSocPercent?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryImportTargetWatts?.value).toBe(2000);
        expect(inverterControlLimit.batteryImportTargetWatts?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryExportTargetWatts?.value).toBe(3500);
        expect(inverterControlLimit.batteryExportTargetWatts?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryChargeMaxWatts?.value).toBe(4000);
        expect(inverterControlLimit.batteryChargeMaxWatts?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryDischargeMaxWatts?.value).toBe(4000);
        expect(inverterControlLimit.batteryDischargeMaxWatts?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryPriorityMode?.value).toBe('battery_first');
        expect(inverterControlLimit.batteryPriorityMode?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryGridChargingEnabled?.value).toBe(false);
        expect(inverterControlLimit.batteryGridChargingEnabled?.source).toBe('mqtt');
    });

    it('should prioritize battery_first over export_first priority mode', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryPriorityMode: 'export_first',
            },
            {
                source: 'mqtt',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryPriorityMode: 'battery_first',
            },
        ]);

        expect(inverterControlLimit.batteryPriorityMode?.value).toBe('battery_first');
        expect(inverterControlLimit.batteryPriorityMode?.source).toBe('mqtt');
    });

    it('should use export_first when only one source provides it', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryPriorityMode: 'export_first',
            },
            {
                source: 'mqtt',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryPriorityMode: undefined,
            },
        ]);

        expect(inverterControlLimit.batteryPriorityMode?.value).toBe('export_first');
        expect(inverterControlLimit.batteryPriorityMode?.source).toBe('fixed');
    });

    it('should prioritize false over true for grid charging enabled', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryGridChargingEnabled: true,
            },
            {
                source: 'mqtt',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryGridChargingEnabled: false,
            },
        ]);

        expect(inverterControlLimit.batteryGridChargingEnabled?.value).toBe(false);
        expect(inverterControlLimit.batteryGridChargingEnabled?.source).toBe('mqtt');
    });

    it('should take minimum values for numeric battery limits', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryTargetSocPercent: 90,
                batteryImportTargetWatts: 4000,
                batteryExportTargetWatts: 5000,
                batteryChargeMaxWatts: 6000,
                batteryDischargeMaxWatts: 5500,
                batteryGridChargingMaxWatts: 3000,
            },
            {
                source: 'csipAus',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryTargetSocPercent: 60, // Lower (more restrictive)
                batteryImportTargetWatts: 2500, // Lower (more restrictive)
                batteryExportTargetWatts: 3000, // Lower (more restrictive)
                batteryChargeMaxWatts: 4500, // Lower (more restrictive)
                batteryDischargeMaxWatts: 4000, // Lower (more restrictive)
                batteryGridChargingMaxWatts: 2000, // Lower (more restrictive)
            },
        ]);

        expect(inverterControlLimit.batteryTargetSocPercent?.value).toBe(60);
        expect(inverterControlLimit.batteryTargetSocPercent?.source).toBe('csipAus');
        expect(inverterControlLimit.batteryImportTargetWatts?.value).toBe(2500);
        expect(inverterControlLimit.batteryImportTargetWatts?.source).toBe('csipAus');
        expect(inverterControlLimit.batteryExportTargetWatts?.value).toBe(3000);
        expect(inverterControlLimit.batteryExportTargetWatts?.source).toBe('csipAus');
        expect(inverterControlLimit.batteryChargeMaxWatts?.value).toBe(4500);
        expect(inverterControlLimit.batteryChargeMaxWatts?.source).toBe('csipAus');
        expect(inverterControlLimit.batteryDischargeMaxWatts?.value).toBe(4000);
        expect(inverterControlLimit.batteryDischargeMaxWatts?.source).toBe('csipAus');
        expect(inverterControlLimit.batteryGridChargingMaxWatts?.value).toBe(2000);
        expect(inverterControlLimit.batteryGridChargingMaxWatts?.source).toBe('csipAus');
    });

    it('should handle mixed battery configurations correctly', () => {
        const inverterControlLimit = getActiveInverterControlLimit([
            {
                source: 'fixed',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryTargetSocPercent: 80,
                batteryPriorityMode: 'export_first',
                // Other battery fields undefined
            },
            {
                source: 'mqtt',
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                ...defaultBatteryFields,
                batteryImportTargetWatts: 2000,
                batteryGridChargingEnabled: false,
                // Other battery fields undefined
            },
        ]);

        expect(inverterControlLimit.batteryTargetSocPercent?.value).toBe(80);
        expect(inverterControlLimit.batteryTargetSocPercent?.source).toBe('fixed');
        expect(inverterControlLimit.batteryImportTargetWatts?.value).toBe(2000);
        expect(inverterControlLimit.batteryImportTargetWatts?.source).toBe('mqtt');
        expect(inverterControlLimit.batteryPriorityMode?.value).toBe('export_first');
        expect(inverterControlLimit.batteryPriorityMode?.source).toBe('fixed');
        expect(inverterControlLimit.batteryGridChargingEnabled?.value).toBe(false);
        expect(inverterControlLimit.batteryGridChargingEnabled?.source).toBe('mqtt');
        
        // Fields not provided by any source should be undefined
        expect(inverterControlLimit.batteryExportTargetWatts).toBeUndefined();
        expect(inverterControlLimit.batteryChargeMaxWatts).toBeUndefined();
        expect(inverterControlLimit.batteryDischargeMaxWatts).toBeUndefined();
        expect(inverterControlLimit.batteryGridChargingMaxWatts).toBeUndefined();
    });
});
