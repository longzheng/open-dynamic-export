import { describe, expect, it, vi } from 'vitest';
import { FixedSetpoint } from './index.js';
import { type Config } from '../../helpers/config.js';

// Mock influxdb helper to avoid environment dependencies
vi.mock('../../helpers/influxdb.js', () => ({
    writeControlLimit: vi.fn(),
}));

describe('FixedSetpoint', () => {
    describe('basic configuration', () => {
        it('should return control limits for basic fixed configuration', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                connect: true,
                exportLimitWatts: 5000,
                generationLimitWatts: 10000,
                importLimitWatts: 3000,
                loadLimitWatts: 2000,
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result).toEqual({
                source: 'fixed',
                opModConnect: true,
                opModEnergize: true,
                opModExpLimW: 5000,
                opModGenLimW: 10000,
                opModImpLimW: 3000,
                opModLoadLimW: 2000,
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

    describe('battery configuration', () => {
        it('should map battery-specific configuration correctly', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                connect: true,
                exportLimitWatts: 5000,
                batterySocTargetPercent: 80,
                importTargetWatts: 2000,
                exportTargetWatts: 3000,
                batteryChargeMaxWatts: 4000,
                batteryDischargeMaxWatts: 5000,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 2500,
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryTargetSocPercent).toBe(80);
            expect(result.batteryImportTargetWatts).toBe(2000);
            expect(result.batteryExportTargetWatts).toBe(3000);
            expect(result.batteryChargeMaxWatts).toBe(4000);
            expect(result.batteryDischargeMaxWatts).toBe(5000);
            expect(result.batteryPriorityMode).toBe('battery_first');
            expect(result.batteryGridChargingEnabled).toBe(true);
            expect(result.batteryGridChargingMaxWatts).toBe(2500);
        });

        it('should handle export_first priority mode', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                batteryPriorityMode: 'export_first',
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryPriorityMode).toBe('export_first');
        });

        it('should handle disabled grid charging', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                batteryGridChargingEnabled: false,
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryGridChargingEnabled).toBe(false);
        });

        it('should leave undefined fields as undefined', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                connect: true,
                exportLimitWatts: 5000,
                // No battery configuration
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryTargetSocPercent).toBeUndefined();
            expect(result.batteryImportTargetWatts).toBeUndefined();
            expect(result.batteryExportTargetWatts).toBeUndefined();
            expect(result.batteryChargeMaxWatts).toBeUndefined();
            expect(result.batteryDischargeMaxWatts).toBeUndefined();
            expect(result.batteryPriorityMode).toBeUndefined();
            expect(result.batteryGridChargingEnabled).toBeUndefined();
            expect(result.batteryGridChargingMaxWatts).toBeUndefined();
        });

        it('should handle partial battery configuration', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                batterySocTargetPercent: 90,
                batteryPriorityMode: 'battery_first',
                // Other battery fields undefined
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryTargetSocPercent).toBe(90);
            expect(result.batteryPriorityMode).toBe('battery_first');
            expect(result.batteryImportTargetWatts).toBeUndefined();
            expect(result.batteryExportTargetWatts).toBeUndefined();
            expect(result.batteryChargeMaxWatts).toBeUndefined();
            expect(result.batteryDischargeMaxWatts).toBeUndefined();
            expect(result.batteryGridChargingEnabled).toBeUndefined();
            expect(result.batteryGridChargingMaxWatts).toBeUndefined();
        });

        it('should handle minimum battery SOC settings', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                batterySocTargetPercent: 20,
                batteryGridChargingEnabled: false,
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryTargetSocPercent).toBe(20);
            expect(result.batteryGridChargingEnabled).toBe(false);
        });

        it('should handle maximum battery SOC settings', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                batterySocTargetPercent: 100,
                batteryGridChargingEnabled: true,
                importTargetWatts: 5000,
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.batteryTargetSocPercent).toBe(100);
            expect(result.batteryGridChargingEnabled).toBe(true);
            expect(result.batteryImportTargetWatts).toBe(5000);
        });
    });

    describe('source attribution', () => {
        it('should always set source as "fixed"', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {
                batterySocTargetPercent: 50,
            };

            const setpoint = new FixedSetpoint({ config });
            const result = setpoint.getInverterControlLimit();

            expect(result.source).toBe('fixed');
        });
    });

    describe('destroy', () => {
        it('should handle destroy gracefully', () => {
            const config: NonNullable<Config['setpoints']['fixed']> = {};

            const setpoint = new FixedSetpoint({ config });

            expect(() => setpoint.destroy()).not.toThrow();
        });
    });
});
