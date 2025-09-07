import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SapnRELE2WSetpoint } from './index.js';

describe('AusgridEA029Setpoint', () => {
    let sapnRELE2WSetpoint: SapnRELE2WSetpoint;

    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();

        sapnRELE2WSetpoint = new SapnRELE2WSetpoint();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return correct control limit during charge window', () => {
        process.env.TZ = 'Australia/Adelaide';
        vi.setSystemTime(new Date('2024-01-01T10:30:00'));

        const result = sapnRELE2WSetpoint.getInverterControlLimit();

        expect(result).toEqual({
            source: 'twoWayTariff',
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: 0,
            opModGenLimW: undefined,
            opModImpLimW: undefined,
            opModLoadLimW: undefined,
            // Battery controls - not used in two-way tariff setpoints
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
        } satisfies typeof result);
    });

    it('should return no control limit outside of charge window', () => {
        process.env.TZ = 'Australia/Adelaide';
        vi.setSystemTime(new Date('2024-01-01T08:00:00'));

        const result = sapnRELE2WSetpoint.getInverterControlLimit();

        expect(result).toEqual({
            source: 'twoWayTariff',
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: undefined,
            opModGenLimW: undefined,
            opModImpLimW: undefined,
            opModLoadLimW: undefined,
            // Battery controls - not used in two-way tariff setpoints
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
        } satisfies typeof result);
    });

    it('should throw exception when timezone is not NSW', () => {
        process.env.TZ = 'Australia/Perth';
        vi.setSystemTime(new Date('2024-01-01T08:00:00'));

        expect(() => sapnRELE2WSetpoint.getInverterControlLimit()).toThrow(
            'Two-way tariff setpoint requires the timezone to be set to SA',
        );
    });
});
