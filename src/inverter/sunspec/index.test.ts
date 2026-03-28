import { describe, expect, it } from 'vitest';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { PVConn } from '../../connections/sunspec/models/status.js';
import {
    ChaSt,
    ChaGriSet,
    StorCtl_Mod,
} from '../../connections/sunspec/models/storage.js';
import type { StorageModel } from '../../connections/sunspec/models/storage.js';
import {
    getGenConnectStatusFromPVConn,
    generateInverterDataStorage,
    generateStorageModelWriteFromBatteryControl,
} from './index.js';

describe('getGenConnectStatusFromPVConn', () => {
    it('should return 0 if inverter is disconnected', () => {
        const result = getGenConnectStatusFromPVConn({
            pvConn: 0 as PVConn,
            inverterW: 0,
        });

        expect(result).toEqual(0 as ConnectStatusValue);
    });

    it('should set Operating only when inverter W > 0', () => {
        const result = getGenConnectStatusFromPVConn({
            pvConn: PVConn.CONNECTED | PVConn.AVAILABLE | PVConn.OPERATING,
            inverterW: 100,
        });

        expect(result).toEqual(
            ConnectStatusValue.Available |
                ConnectStatusValue.Connected |
                ConnectStatusValue.Operating,
        );
    });

    it('should not set Operating when inverter W = 0', () => {
        const result = getGenConnectStatusFromPVConn({
            pvConn: PVConn.CONNECTED | PVConn.AVAILABLE | PVConn.OPERATING,
            inverterW: 0,
        });

        expect(result).toEqual(
            ConnectStatusValue.Available | ConnectStatusValue.Connected,
        );
    });

    it('should return 0 if inverter is available, operating (not connected)', () => {
        const result = getGenConnectStatusFromPVConn({
            pvConn: PVConn.AVAILABLE | PVConn.OPERATING,
            inverterW: 100,
        });

        // this is subject to debate
        // the following is the advise from SAPN
        // The current SAPN interpretation is that operating would mean operating as expected, in which case it could only be considered operating if it is connected and available. Therefore a connectstatus of 6 would not be possible in our implementation.
        // Our interpretation would be as follows:
        // Bit 0: Connected = AC connected
        // Bit 1: Available = AC connected and available to react to controls to increase or reduce energy dispatch
        // Bit 2: Operating = Connected, available, and currently observing a powerflow or carrying out a control to increase or reduce energy dispatch (eg. Includes opmodgenlimw = 0 but excludes opmodenergize = false)
        expect(result).toEqual(0);
    });
});

describe('generateInverterDataStorage', () => {
    it('should generate battery storage data from storage model', () => {
        const storageModel = {
            ID: 124 as const,
            L: 26,
            WChaMax: 5000,
            WChaGra: 5000,
            WDisChaGra: 6000,
            StorCtl_Mod: StorCtl_Mod.CHARGE,
            VAChaMax: null,
            MinRsvPct: 2000,
            ChaState: 8000,
            StorAval: 100000,
            InBatV: 4800,
            ChaSt: ChaSt.CHARGING,
            OutWRte: 5000,
            InWRte: 7000,
            InOutWRte_WinTms: 60,
            InOutWRte_RvrtTms: 120,
            InOutWRte_RmpTms: 30,
            ChaGriSet: ChaGriSet.GRID,
            WChaMax_SF: 0,
            WChaDisChaGra_SF: 0,
            VAChaMax_SF: null,
            MinRsvPct_SF: -2,
            ChaState_SF: -2,
            StorAval_SF: -1,
            InBatV_SF: -1,
            InOutWRte_SF: -2,
        };

        const result = generateInverterDataStorage({ storage: storageModel });

        expect(result).toEqual({
            stateOfChargePercent: 80, // 8000 * 10^-2
            availableEnergyWh: 10000, // 100000 * 10^-1
            batteryVoltage: 480, // 4800 * 10^-1
            chargeStatus: ChaSt.CHARGING,
            maxChargeRateWatts: 5000,
            maxDischargeRateWatts: 6000,
            currentChargeRatePercent: 70, // 7000 * 10^-2
            currentDischargeRatePercent: 50, // 5000 * 10^-2
            minReservePercent: 20, // 2000 * 10^-2
            gridChargingPermitted: ChaGriSet.GRID,
        });
    });

    it('should handle null values correctly', () => {
        const storageModel = {
            ID: 124 as const,
            L: 26,
            WChaMax: 3000,
            WChaGra: 3000,
            WDisChaGra: 3000,
            StorCtl_Mod: StorCtl_Mod.DISCHARGE,
            VAChaMax: null,
            MinRsvPct: null,
            ChaState: null,
            StorAval: null,
            InBatV: null,
            ChaSt: null,
            OutWRte: null,
            InWRte: null,
            InOutWRte_WinTms: null,
            InOutWRte_RvrtTms: null,
            InOutWRte_RmpTms: null,
            ChaGriSet: null,
            WChaMax_SF: 0,
            WChaDisChaGra_SF: 0,
            VAChaMax_SF: null,
            MinRsvPct_SF: null,
            ChaState_SF: null,
            StorAval_SF: null,
            InBatV_SF: null,
            InOutWRte_SF: null,
        };

        const result = generateInverterDataStorage({ storage: storageModel });

        expect(result).toEqual({
            stateOfChargePercent: null,
            availableEnergyWh: null,
            batteryVoltage: null,
            chargeStatus: null,
            maxChargeRateWatts: 3000,
            maxDischargeRateWatts: 3000,
            currentChargeRatePercent: null,
            currentDischargeRatePercent: null,
            minReservePercent: null,
            gridChargingPermitted: null,
        });
    });

    it('should handle battery in different charge states', () => {
        const chargeStatuses = [
            ChaSt.OFF,
            ChaSt.EMPTY,
            ChaSt.DISCHARGING,
            ChaSt.CHARGING,
            ChaSt.FULL,
            ChaSt.HOLDING,
            ChaSt.TESTING,
        ];

        chargeStatuses.forEach((status) => {
            const storageModel = {
                ID: 124 as const,
                L: 26,
                WChaMax: 5000,
                WChaGra: 5000,
                WDisChaGra: 5000,
                StorCtl_Mod: StorCtl_Mod.CHARGE,
                VAChaMax: null,
                MinRsvPct: null,
                ChaState: null,
                StorAval: null,
                InBatV: null,
                ChaSt: status,
                OutWRte: null,
                InWRte: null,
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: null,
                WChaMax_SF: 0,
                WChaDisChaGra_SF: 0,
                VAChaMax_SF: null,
                MinRsvPct_SF: null,
                ChaState_SF: null,
                StorAval_SF: null,
                InBatV_SF: null,
                InOutWRte_SF: null,
            };

            const result = generateInverterDataStorage({
                storage: storageModel,
            });
            expect(result.chargeStatus).toBe(status);
        });
    });

    it('should handle both grid charging modes', () => {
        const gridChargingModes = [ChaGriSet.PV, ChaGriSet.GRID];

        gridChargingModes.forEach((mode) => {
            const storageModel = {
                ID: 124 as const,
                L: 26,
                WChaMax: 5000,
                WChaGra: 5000,
                WDisChaGra: 5000,
                StorCtl_Mod: StorCtl_Mod.CHARGE,
                VAChaMax: null,
                MinRsvPct: null,
                ChaState: null,
                StorAval: null,
                InBatV: null,
                ChaSt: null,
                OutWRte: null,
                InWRte: null,
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: mode,
                WChaMax_SF: 0,
                WChaDisChaGra_SF: 0,
                VAChaMax_SF: null,
                MinRsvPct_SF: null,
                ChaState_SF: null,
                StorAval_SF: null,
                InBatV_SF: null,
                InOutWRte_SF: null,
            };

            const result = generateInverterDataStorage({
                storage: storageModel,
            });
            expect(result.gridChargingPermitted).toBe(mode);
        });
    });

    it('should handle battery with partial data (realistic scenario)', () => {
        const storageModel = {
            ID: 124 as const,
            L: 26,
            WChaMax: 5000,
            WChaGra: 5000,
            WDisChaGra: 5000,
            StorCtl_Mod: StorCtl_Mod.CHARGE,
            VAChaMax: null,
            MinRsvPct: 1500, // 15%
            ChaState: 6500, // 65%
            StorAval: 80000,
            InBatV: 5200, // 520V
            ChaSt: ChaSt.CHARGING,
            OutWRte: null, // Not discharging
            InWRte: 8000, // Charging at 80%
            InOutWRte_WinTms: 60,
            InOutWRte_RvrtTms: 120,
            InOutWRte_RmpTms: 30,
            ChaGriSet: ChaGriSet.PV, // Only PV charging allowed
            WChaMax_SF: 0,
            WChaDisChaGra_SF: 0,
            VAChaMax_SF: null,
            MinRsvPct_SF: -2,
            ChaState_SF: -2,
            StorAval_SF: -1,
            InBatV_SF: -1,
            InOutWRte_SF: -2,
        };

        const result = generateInverterDataStorage({ storage: storageModel });

        expect(result).toEqual({
            stateOfChargePercent: 65,
            availableEnergyWh: 8000,
            batteryVoltage: 520,
            chargeStatus: ChaSt.CHARGING,
            maxChargeRateWatts: 5000,
            maxDischargeRateWatts: 5000,
            currentChargeRatePercent: 80,
            currentDischargeRatePercent: null,
            minReservePercent: 15,
            gridChargingPermitted: ChaGriSet.PV,
        });
    });
});

describe('generateStorageModelWriteFromBatteryControl', () => {
    // Realistic Fronius Gen24 storage model: WChaMax=35840W, SF=0, InOutWRte_SF=-2
    const baseStorageModel: StorageModel = {
        ID: 124 as const,
        L: 26,
        WChaMax: 35840,
        WChaGra: 100,
        WDisChaGra: 100,
        StorCtl_Mod: 0 as StorCtl_Mod,
        VAChaMax: null,
        MinRsvPct: null,
        ChaState: 5000,
        StorAval: null,
        InBatV: null,
        ChaSt: ChaSt.CHARGING,
        OutWRte: 10000,
        InWRte: 10000,
        InOutWRte_WinTms: null,
        InOutWRte_RvrtTms: null,
        InOutWRte_RmpTms: null,
        ChaGriSet: ChaGriSet.PV,
        WChaMax_SF: 0,
        WChaDisChaGra_SF: 0,
        VAChaMax_SF: null,
        MinRsvPct_SF: -2,
        ChaState_SF: -2,
        StorAval_SF: null,
        InBatV_SF: null,
        InOutWRte_SF: -2,
    };

    it('should set StorCtl_Mod=3 (both bits) for charge mode', () => {
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 5000,
                mode: 'charge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.StorCtl_Mod).toBe(
            StorCtl_Mod.CHARGE | StorCtl_Mod.DISCHARGE,
        );
    });

    it('should set StorCtl_Mod=3 (both bits) for discharge mode', () => {
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: -3000,
                mode: 'discharge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.StorCtl_Mod).toBe(
            StorCtl_Mod.CHARGE | StorCtl_Mod.DISCHARGE,
        );
    });

    it('should set StorCtl_Mod=0 (release control) for idle mode', () => {
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 0,
                mode: 'idle',
            },
            storageModel: baseStorageModel,
        });

        expect(result.StorCtl_Mod).toBe(0,
        );
    });

    it('should convert charge watts to InWRte percentage with scale factor', () => {
        // 5000W out of 35840W WChaMax = 13.95%
        // With SF=-2, raw = 13.95 * 100 = 1395
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 5000,
                mode: 'charge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.InWRte).toBe(1395);
        expect(result.OutWRte).toBe(0);
    });

    it('should convert discharge watts to OutWRte percentage with scale factor', () => {
        // 3000W out of 35840W = 8.37%
        // With SF=-2, raw = 8.37 * 100 = 837
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: -3000,
                mode: 'discharge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.InWRte).toBe(0);
        expect(result.OutWRte).toBe(837);
    });

    it('should set both InWRte and OutWRte to 0 for idle mode', () => {
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 0,
                mode: 'idle',
            },
            storageModel: baseStorageModel,
        });

        expect(result.InWRte).toBe(0);
        expect(result.OutWRte).toBe(0);
    });

    it('should cap charge rate at user-configured chargeRatePercent', () => {
        // Target: 20000W = 55.8% of 35840W
        // Cap: 30% → raw = 30 * 100 = 3000
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 20000,
                mode: 'charge',
                chargeRatePercent: 30,
            },
            storageModel: baseStorageModel,
        });

        expect(result.InWRte).toBe(3000);
    });

    it('should cap discharge rate at user-configured dischargeRatePercent', () => {
        // Target: 20000W = 55.8% of 35840W
        // Cap: 25% → raw = 25 * 100 = 2500
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: -20000,
                mode: 'discharge',
                dischargeRatePercent: 25,
            },
            storageModel: baseStorageModel,
        });

        expect(result.OutWRte).toBe(2500);
    });

    it('should not cap when target is below user-configured rate', () => {
        // Target: 1000W = 2.79% of 35840W, cap at 50% — target wins (lower)
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 1000,
                mode: 'charge',
                chargeRatePercent: 50,
            },
            storageModel: baseStorageModel,
        });

        expect(result.InWRte).toBe(279);
    });

    it('should pass through existing WChaGra/WDisChaGra unchanged', () => {
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 5000,
                mode: 'charge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.WChaGra).toBe(baseStorageModel.WChaGra);
        expect(result.WDisChaGra).toBe(baseStorageModel.WDisChaGra);
    });

    it('should set InOutWRte_RvrtTms to 60 for safety', () => {
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 5000,
                mode: 'charge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.InOutWRte_RvrtTms).toBe(60);
    });

    it('should handle full charge rate (100% of WChaMax)', () => {
        // 35840W = 100% of WChaMax → raw = 10000
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 35840,
                mode: 'charge',
            },
            storageModel: baseStorageModel,
        });

        expect(result.InWRte).toBe(10000);
    });

    it('should handle InOutWRte_SF=0 (no scaling)', () => {
        const storageModelSF0: StorageModel = {
            ...baseStorageModel,
            InOutWRte_SF: 0,
        };

        // 5000W / 35840W * 100 = 13.95% → round to 14
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 5000,
                mode: 'charge',
            },
            storageModel: storageModelSF0,
        });

        expect(result.InWRte).toBe(14);
    });

    it('should handle null InOutWRte_SF (defaults to 0)', () => {
        const storageModelNullSF: StorageModel = {
            ...baseStorageModel,
            InOutWRte_SF: null,
        };

        // Same as SF=0: 5000W / 35840W * 100 = 13.95% → round to 14
        const result = generateStorageModelWriteFromBatteryControl({
            batteryControl: {
                targetPowerWatts: 5000,
                mode: 'charge',
            },
            storageModel: storageModelNullSF,
        });

        expect(result.InWRte).toBe(14);
    });
});
