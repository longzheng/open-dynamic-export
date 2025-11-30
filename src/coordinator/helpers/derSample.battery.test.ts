import { describe, it, expect } from 'vitest';
import { generateDerSample } from './derSample.js';
import { type InverterData } from '../../inverter/inverterData.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { ChaSt, ChaGriSet } from '../../connections/sunspec/models/storage.js';

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
            batteryCount: 1,
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
                    minReservePercent: 15,
                    gridChargingPermitted: ChaGriSet.PV,
                },
            }),
            createMockInverterData(), // No storage
        ];

        const result = generateDerSample({ invertersData });

        // Average SOC: (80 + 60) / 2 = 70
        // Total energy: 10000 + 8000 = 18000
        // Total max charge: 5000 + 3000 = 8000
        // Total max discharge: 4000 + 3000 = 7000
        expect(result.battery).toEqual({
            averageSocPercent: 70,
            totalAvailableEnergyWh: 18000,
            totalMaxChargeRateWatts: 8000,
            totalMaxDischargeRateWatts: 7000,
            batteryCount: 2,
        });
    });

    it('should handle null SOC values gracefully', () => {
        const invertersData: InverterData[] = [
            createMockInverterData({
                storage: {
                    stateOfChargePercent: null, // SOC not available
                    availableEnergyWh: 10000,
                    batteryVoltage: 400,
                    chargeStatus: ChaSt.HOLDING,
                    maxChargeRateWatts: 5000,
                    maxDischargeRateWatts: 5000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: null,
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        expect(result.battery).toEqual({
            averageSocPercent: null, // No SOC values to average
            totalAvailableEnergyWh: 10000,
            totalMaxChargeRateWatts: 5000,
            totalMaxDischargeRateWatts: 5000,
            batteryCount: 1,
        });
    });

    it('should average only available SOC values when some are null', () => {
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
                    minReservePercent: 20,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
            createMockInverterData({
                storage: {
                    stateOfChargePercent: null, // SOC not available
                    availableEnergyWh: 8000,
                    batteryVoltage: 380,
                    chargeStatus: ChaSt.HOLDING,
                    maxChargeRateWatts: 3000,
                    maxDischargeRateWatts: 3000,
                    currentChargeRatePercent: null,
                    currentDischargeRatePercent: null,
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
                    minReservePercent: 25,
                    gridChargingPermitted: ChaGriSet.GRID,
                },
            }),
        ];

        const result = generateDerSample({ invertersData });

        // Average SOC of available values: (80 + 60) / 2 = 70
        // Total energy: 10000 + 8000 + 12000 = 30000
        expect(result.battery).toEqual({
            averageSocPercent: 70,
            totalAvailableEnergyWh: 30000,
            totalMaxChargeRateWatts: 14000,
            totalMaxDischargeRateWatts: 14000,
            batteryCount: 3,
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
            batteryCount: 2,
        });
    });
});
