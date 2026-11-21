import { describe, it, expect } from 'vitest';
import type { InverterData } from '../../inverter/inverterData.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { ChaSt, ChaGriSet } from '../../connections/sunspec/models/storage.js';
import { generateDerSample } from './derSample.js';

describe('generateDerSample - Battery Aggregation', () => {
    const createMockInverterData = (
        overrides: Partial<InverterData> = {},
    ): InverterData => ({
        date: new Date(),
        inverter: {
            realPower: 5000,
            reactivePower: 0,
            voltagePhaseA: 240,
            voltagePhaseB: 240,
            voltagePhaseC: 240,
            frequency: 60,
        },
        nameplate: {
            type: DERTyp.PV,
            maxW: 10000,
            maxVA: 10000,
            maxVar: 5000,
        },
        settings: {
            maxW: 10000,
            maxVA: 10000,
            maxVar: 5000,
        },
        status: {
            operationalModeStatus: OperationalModeStatusValue.OperationalMode,
            genConnectStatus:
                ConnectStatusValue.Connected +
                ConnectStatusValue.Available +
                ConnectStatusValue.Operating,
        },
        ...overrides,
    });

    it('should return null battery data when no inverters have storage', () => {
        const invertersData: InverterData[] = [
            createMockInverterData(),
            createMockInverterData(),
        ];

        const result = generateDerSample({ invertersData });

        expect(result.battery).toBeNull();
    });

    it('should aggregate battery data from one inverter with storage', () => {
        const invertersData: InverterData[] = [
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 75,
                    availableEnergyWh: 10000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.CHARGING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: 80,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
            createMockInverterData(), // No storage
        ];

        const result = generateDerSample({ invertersData });

        expect(result.battery).toEqual({
            averageSocPercent: 75,
            totalAvailableEnergyWh: 10000,
            totalMaxChargeRateWatts: 5000,
            totalMaxDischargeRateWatts: 5000,
            totalCurrentBatteryPowerWatts: null,
            batteryCount: 1,
            batteryInverterSolarW: 5000,
        });
    });

    it('should aggregate battery data from multiple inverters with storage', () => {
        const invertersData: InverterData[] = [
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 80,
                    availableEnergyWh: 10000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.CHARGING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 4000,
                    currentChargeRatePercent: 90,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 60,
                    availableEnergyWh: 8000,
                    batteryVoltage: 380,
                    chargeStatus: ChaSt.DISCHARGING,
                    maxChargeRateWatts: 3000,
                    maxDischargeRateWatts: 3000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: 50,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 15,
                    gridChargingPermitted: ChaGriSet.PV,
                },
            }),
            createMockInverterData(), // No storage
        ];

        const result = generateDerSample({ invertersData });

        // Average SoC: (80 + 60) / 2 = 70
        // Total energy: 10000 + 8000 = 18000
        // Total max charge: 5000 + 3000 = 8000
        // Total max discharge: 4000 + 3000 = 7000
        expect(result.battery).toEqual({
            averageSocPercent: 70,
            totalAvailableEnergyWh: 18000,
            totalMaxChargeRateWatts: 8000,
            totalMaxDischargeRateWatts: 7000,
            totalCurrentBatteryPowerWatts: null,
            batteryCount: 2,
            batteryInverterSolarW: 10000,
        });
    });

    it('should handle null SoC values gracefully', () => {
        const invertersData: InverterData[] = [
            createMockInverterData({
                storage: {
                    stateOfChargePercent: null, // SoC not available
                    availableEnergyWh: 10000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.HOLDING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        expect(result.battery).toEqual({
            averageSocPercent: null, // No SoC values to average
            totalAvailableEnergyWh: 10000,
            totalMaxChargeRateWatts: 5000,
            totalMaxDischargeRateWatts: 5000,
            totalCurrentBatteryPowerWatts: null,
            batteryCount: 1,
            batteryInverterSolarW: 5000,
        });
    });

    it('should average only available SoC values when some are null', () => {
        const invertersData: InverterData[] = [
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 80,
                    availableEnergyWh: 10000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.CHARGING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: 90,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
            createMockInverterData({
                storage: {
                    stateOfChargePercent: null, // SoC not available
                    availableEnergyWh: 8000,
                    batteryVoltage: 380,
                    chargeStatus: ChaSt.HOLDING,
                    maxChargeRateWatts: 3000,
                    maxDischargeRateWatts: 3000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 15,
                    gridChargingPermitted: ChaGriSet.PV,
                },
            }),
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 60,
                    availableEnergyWh: 12000,
                    batteryVoltage: 420,
                    chargeStatus: ChaSt.DISCHARGING,
                    maxChargeRateWatts: 6000,
                    maxDischargeRateWatts: 6000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: 70,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 25,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        // Average SoC of available values: (80 + 60) / 2 = 70
        // Total energy: 10000 + 8000 + 12000 = 30000
        expect(result.battery).toEqual({
            averageSocPercent: 70,
            totalAvailableEnergyWh: 30000,
            totalMaxChargeRateWatts: 14000,
            totalMaxDischargeRateWatts: 14000,
            totalCurrentBatteryPowerWatts: null,
            batteryCount: 3,
            batteryInverterSolarW: 15000,
        });
    });

    it('should handle null available energy values', () => {
        const invertersData: InverterData[] = [
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 75,
                    availableEnergyWh: null, // Energy not available
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.HOLDING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
            createMockInverterData({
                storage: {
                    stateOfChargePercent: 65,
                    availableEnergyWh: 8000,
                    batteryVoltage: 380,
                    chargeStatus: ChaSt.HOLDING,
                    maxChargeRateWatts: 3000,
                    maxDischargeRateWatts: 3000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: null,
                    minReservePercent: 15,
                    gridChargingPermitted: ChaGriSet.PV,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        expect(result.battery).toEqual({
            averageSocPercent: 70, // (75 + 65) / 2
            totalAvailableEnergyWh: 8000, // Only one valid energy value
            totalMaxChargeRateWatts: 8000,
            totalMaxDischargeRateWatts: 8000,
            totalCurrentBatteryPowerWatts: null,
            batteryCount: 2,
            batteryInverterSolarW: 10000,
        });
    });

    it('should exclude battery discharge from batteryInverterSolarW (true PV)', () => {
        // On a hybrid, inverter.realPower is net AC. At night with no PV the
        // battery's discharge shows up as positive realPower — it must NOT be
        // counted as solar, otherwise the discharge-net-positive guard reads its
        // own output as "PV" and oscillates.
        const invertersData: InverterData[] = [
            createMockInverterData({
                inverter: {
                    realPower: 2536, // net AC = pure battery discharge at night
                    reactivePower: 0,
                    voltagePhaseA: 240,
                    voltagePhaseB: 240,
                    voltagePhaseC: 240,
                    frequency: 60,
                },
                storage: {
                    stateOfChargePercent: 80,
                    availableEnergyWh: 10000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.DISCHARGING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: 50,
                    currentBatteryPowerWatts: 2462, // discharging (positive)
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.PV,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        // realPower 2536 − discharge 2462 = 74 W of real PV (≈ 0 at night)
        expect(result.battery?.batteryInverterSolarW).toBe(74);
        expect(result.battery?.totalCurrentBatteryPowerWatts).toBe(2462);
    });

    it('should add back battery charge to batteryInverterSolarW (true PV)', () => {
        // When charging, net AC understates PV (charge is consumed before the AC
        // bus), so true PV = realPower + chargePower.
        const invertersData: InverterData[] = [
            createMockInverterData({
                inverter: {
                    realPower: 3000, // net AC = PV(5000) − charge(2000)
                    reactivePower: 0,
                    voltagePhaseA: 240,
                    voltagePhaseB: 240,
                    voltagePhaseC: 240,
                    frequency: 60,
                },
                storage: {
                    stateOfChargePercent: 50,
                    availableEnergyWh: 8000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.CHARGING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: 40,
                    currentDischargeRatePercent: null,
                    currentBatteryPowerWatts: -2000, // charging (negative)
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.PV,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        // realPower 3000 − (−2000) = 5000 W of real PV
        expect(result.battery?.batteryInverterSolarW).toBe(5000);
    });
});
