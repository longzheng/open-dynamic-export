import { describe, expect, it } from 'vitest';
import { getStorageMetrics } from './storageMetrics.js';
import { ChaSt, ChaGriSet, StorCtl_Mod } from '../models/storage.js';

describe('getStorageMetrics', () => {
    it('should apply scale factors correctly to storage metrics', () => {
        const storageModel = {
            ID: 124 as const,
            L: 26,
            WChaMax: 5000,
            WChaGra: 5000,
            WDisChaGra: 5000,
            StorCtl_Mod: StorCtl_Mod.CHARGE,
            VAChaMax: 5000,
            MinRsvPct: 2000,
            ChaState: 8000,
            StorAval: 10000,
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
            VAChaMax_SF: 0,
            MinRsvPct_SF: -2,
            ChaState_SF: -2,
            StorAval_SF: -1,
            InBatV_SF: -1,
            InOutWRte_SF: -2,
        };

        const metrics = getStorageMetrics(storageModel);

        expect(metrics.WChaMax).toBe(5000);
        expect(metrics.WChaGra).toBe(5000);
        expect(metrics.WDisChaGra).toBe(5000);
        expect(metrics.MinRsvPct).toBe(20); // 2000 * 10^-2
        expect(metrics.ChaState).toBe(80); // 8000 * 10^-2
        expect(metrics.StorAval).toBe(1000); // 10000 * 10^-1
        expect(metrics.InBatV).toBe(480); // 4800 * 10^-1
        expect(metrics.OutWRte).toBe(50); // 5000 * 10^-2
        expect(metrics.InWRte).toBe(70); // 7000 * 10^-2
    });

    it('should handle nullable values correctly', () => {
        const storageModel = {
            ID: 124 as const,
            L: 26,
            WChaMax: 5000,
            WChaGra: 5000,
            WDisChaGra: 5000,
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

        const metrics = getStorageMetrics(storageModel);

        expect(metrics.VAChaMax).toBe(null);
        expect(metrics.MinRsvPct).toBe(null);
        expect(metrics.ChaState).toBe(null);
        expect(metrics.StorAval).toBe(null);
        expect(metrics.InBatV).toBe(null);
        expect(metrics.ChaSt).toBe(null);
        expect(metrics.OutWRte).toBe(null);
        expect(metrics.InWRte).toBe(null);
        expect(metrics.ChaGriSet).toBe(null);
    });

    it('should preserve non-scaled values', () => {
        const storageModel = {
            ID: 124 as const,
            L: 26,
            WChaMax: 5000,
            WChaGra: 5000,
            WDisChaGra: 5000,
            StorCtl_Mod: 3, // Both charge and discharge
            VAChaMax: null,
            MinRsvPct: null,
            ChaState: null,
            StorAval: null,
            InBatV: null,
            ChaSt: ChaSt.HOLDING,
            OutWRte: null,
            InWRte: null,
            InOutWRte_WinTms: 60,
            InOutWRte_RvrtTms: 120,
            InOutWRte_RmpTms: 30,
            ChaGriSet: ChaGriSet.PV,
            WChaMax_SF: 0,
            WChaDisChaGra_SF: 0,
            VAChaMax_SF: null,
            MinRsvPct_SF: null,
            ChaState_SF: null,
            StorAval_SF: null,
            InBatV_SF: null,
            InOutWRte_SF: null,
        };

        const metrics = getStorageMetrics(storageModel);

        expect(metrics.StorCtl_Mod).toBe(3);
        expect(metrics.InOutWRte_WinTms).toBe(60);
        expect(metrics.InOutWRte_RvrtTms).toBe(120);
        expect(metrics.InOutWRte_RmpTms).toBe(30);
        expect(metrics.ChaSt).toBe(ChaSt.HOLDING);
        expect(metrics.ChaGriSet).toBe(ChaGriSet.PV);
    });

    it('should handle different charge statuses', () => {
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

            const metrics = getStorageMetrics(storageModel);
            expect(metrics.ChaSt).toBe(status);
        });
    });

    it('should handle both grid charging modes', () => {
        const gridModes = [ChaGriSet.PV, ChaGriSet.GRID];

        gridModes.forEach((mode) => {
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

            const metrics = getStorageMetrics(storageModel);
            expect(metrics.ChaGriSet).toBe(mode);
        });
    });
});
