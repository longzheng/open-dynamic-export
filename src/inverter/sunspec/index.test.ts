import { describe, expect, it } from 'vitest';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import {
    getGenConnectStatusFromPVConn,
    generateInverterDataStorage,
} from './index.js';
import { PVConn } from '../../connections/sunspec/models/status.js';
import {
    ChaSt,
    StorCtl_Mod,
} from '../../connections/sunspec/models/storage.js';
import { type StorageModel } from '../../connections/sunspec/models/storage.js';

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
    describe('basic storage data parsing', () => {
        it('should parse storage model with all fields present', () => {
            const storageModel: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 10000, // 10 kWh capacity
                WChaMax_SF: 0, // Scale factor 0
                WChaGra: 5000, // 5 kW charge rate
                WDisChaGra: 4000, // 4 kW discharge rate
                WChaDisChaGra_SF: 0, // Scale factor 0
                VAChaMax: null,
                VAChaMax_SF: null,
                MinRsvPct: null,
                MinRsvPct_SF: null,
                ChaState: 75, // 75% SOC
                ChaState_SF: 0, // Scale factor 0
                StorAval: null,
                StorAval_SF: null,
                InBatV: null,
                InBatV_SF: null,
                ChaSt: ChaSt.CHARGING, // Charging status
                StorCtl_Mod: StorCtl_Mod.DISCHARGE, // Storage control mode
                InWRte: 30, // 30% charge rate
                OutWRte: 25, // 25% discharge rate
                InOutWRte_SF: 0, // Scale factor 0
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: null,
            };

            const result = generateInverterDataStorage({
                storage: storageModel,
            });

            expect(result).toEqual({
                capacity: 10000,
                maxChargeRate: 5000,
                maxDischargeRate: 4000,
                stateOfCharge: 75,
                chargeStatus: ChaSt.CHARGING,
                storageMode: StorCtl_Mod.DISCHARGE,
                chargeRate: 30,
                dischargeRate: 25,
            });
        });

        it('should handle negative scale factors correctly', () => {
            const storageModel: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 1000, // 1000 with SF -2 = 10 kWh
                WChaMax_SF: -2, // Scale factor -2 (divide by 100)
                WChaGra: 500, // 500 with SF -2 = 5 kW charge rate
                WDisChaGra: 400, // 400 with SF -2 = 4 kW discharge rate
                WChaDisChaGra_SF: -2, // Scale factor -2
                VAChaMax: null,
                VAChaMax_SF: null,
                MinRsvPct: null,
                MinRsvPct_SF: null,
                ChaState: 7500, // 7500 with SF -2 = 75% SOC
                ChaState_SF: -2, // Scale factor -2
                StorAval: null,
                StorAval_SF: null,
                InBatV: null,
                InBatV_SF: null,
                ChaSt: ChaSt.DISCHARGING,
                StorCtl_Mod: StorCtl_Mod.CHARGE,
                InWRte: 3000, // 3000 with SF -2 = 30% charge rate
                OutWRte: 2500, // 2500 with SF -2 = 25% discharge rate
                InOutWRte_SF: -2, // Scale factor -2
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: null,
            };

            const result = generateInverterDataStorage({
                storage: storageModel,
            });

            expect(result).toEqual({
                capacity: 10, // 1000 * 10^(-2)
                maxChargeRate: 5, // 500 * 10^(-2)
                maxDischargeRate: 4, // 400 * 10^(-2)
                stateOfCharge: 75, // 7500 * 10^(-2)
                chargeStatus: ChaSt.DISCHARGING,
                storageMode: StorCtl_Mod.CHARGE,
                chargeRate: 30, // 3000 * 10^(-2)
                dischargeRate: 25, // 2500 * 10^(-2)
            });
        });
    });

    describe('null value handling', () => {
        it('should handle null ChaState gracefully', () => {
            const storageModel: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 10000,
                WChaMax_SF: 0,
                WChaGra: 5000,
                WDisChaGra: 4000,
                WChaDisChaGra_SF: 0,
                VAChaMax: null,
                VAChaMax_SF: null,
                MinRsvPct: null,
                MinRsvPct_SF: null,
                ChaState: null, // SOC not available
                ChaState_SF: -2,
                StorAval: null,
                StorAval_SF: null,
                InBatV: null,
                InBatV_SF: null,
                ChaSt: ChaSt.OFF,
                StorCtl_Mod: StorCtl_Mod.OFF,
                InWRte: 0,
                OutWRte: 0,
                InOutWRte_SF: 0,
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: null,
            };

            const result = generateInverterDataStorage({
                storage: storageModel,
            });

            expect(result.stateOfCharge).toBeNull();
            expect(result.capacity).toBe(10000);
            expect(result.chargeStatus).toBe(ChaSt.OFF);
        });

        it('should handle null charge rate values', () => {
            const storageModel: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 10000,
                WChaMax_SF: 0,
                WChaGra: 5000,
                WDisChaGra: 4000,
                WChaDisChaGra_SF: 0,
                VAChaMax: null,
                VAChaMax_SF: null,
                MinRsvPct: null,
                MinRsvPct_SF: null,
                ChaState: 50,
                ChaState_SF: 0,
                StorAval: null,
                StorAval_SF: null,
                InBatV: null,
                InBatV_SF: null,
                ChaSt: ChaSt.OFF,
                StorCtl_Mod: StorCtl_Mod.OFF,
                InWRte: null, // Charge rate not available
                OutWRte: null, // Discharge rate not available
                InOutWRte_SF: 0,
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: null,
            };

            const result = generateInverterDataStorage({
                storage: storageModel,
            });

            expect(result.chargeRate).toBeNull();
            expect(result.dischargeRate).toBeNull();
            expect(result.stateOfCharge).toBe(50);
        });
    });

    describe('charge status mapping', () => {
        it('should map different charge status values correctly', () => {
            const baseModel: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 10000,
                WChaMax_SF: 0,
                WChaGra: 5000,
                WDisChaGra: 4000,
                WChaDisChaGra_SF: 0,
                VAChaMax: null,
                VAChaMax_SF: null,
                MinRsvPct: null,
                MinRsvPct_SF: null,
                ChaState: 50,
                ChaState_SF: 0,
                StorAval: null,
                StorAval_SF: null,
                InBatV: null,
                InBatV_SF: null,
                StorCtl_Mod: StorCtl_Mod.OFF,
                InWRte: 0,
                OutWRte: 0,
                InOutWRte_SF: 0,
                InOutWRte_WinTms: null,
                InOutWRte_RvrtTms: null,
                InOutWRte_RmpTms: null,
                ChaGriSet: null,
            };

            // Test different charging states
            const testCases = [
                { status: ChaSt.OFF, expected: ChaSt.OFF },
                { status: ChaSt.EMPTY, expected: ChaSt.EMPTY },
                { status: ChaSt.DISCHARGING, expected: ChaSt.DISCHARGING },
                { status: ChaSt.CHARGING, expected: ChaSt.CHARGING },
                { status: ChaSt.FULL, expected: ChaSt.FULL },
                { status: ChaSt.HOLDING, expected: ChaSt.HOLDING },
                { status: ChaSt.TESTING, expected: ChaSt.TESTING },
            ];

            testCases.forEach(({ status, expected }) => {
                const model = { ...baseModel, ChaSt: status };
                const result = generateInverterDataStorage({ storage: model });
                expect(result.chargeStatus).toBe(expected);
            });
        });
    });
});
