import { describe, it, expect } from 'vitest';
import { type NameplateModel } from '../sunspec/models/nameplate';
import type { DERCapabilityResponse } from '../sep2/models/derCapability';
import { DERControlType } from '../sep2/models/derControlType';
import { DOEModesSupportedType } from '../sep2/models/doeModesSupportedType';
import {
    getConnectStatusFromPVConn,
    getDerCapabilityResponseFromSunSpecArray,
} from './der';
import { DERType } from '../sep2/models/derType';
import { PVConn } from '../sunspec/models/status';
import { ConnectStatus } from '../sep2/models/connectStatus';

describe('getDerCapabilityResponseFromSunSpecArray', () => {
    it('should return the correct DERCapabilityResponse for valid nameplateModels', () => {
        const nameplateModels: NameplateModel[] = [
            {
                ARtg: 2080,
                ARtg_SF: -2,
                AhrRtg: null,
                AhrRtg_SF: null,
                DERTyp: 4,
                ID: 120,
                L: 26,
                MaxChaRte: null,
                MaxChaRte_SF: null,
                MaxDisChaRte: null,
                MaxDisChaRte_SF: null,
                PFRtgQ1: -800,
                PFRtgQ2: null,
                PFRtgQ3: null,
                PFRtgQ4: 800,
                PFRtg_SF: -3,
                VARtg: 500,
                VARtg_SF: 1,
                VArRtgQ1: 500,
                VArRtgQ2: null,
                VArRtgQ3: null,
                VArRtgQ4: -500,
                VArRtg_SF: 1,
                WHRtg: null,
                WHRtg_SF: null,
                WRtg: 500,
                WRtg_SF: 1,
            },
        ];

        const result: DERCapabilityResponse =
            getDerCapabilityResponseFromSunSpecArray(nameplateModels);

        expect(result).toEqual({
            modesSupported:
                DERControlType.opModEnergize |
                DERControlType.opModMaxLimW |
                DERControlType.opModTargetW,
            doeModesSupported: DOEModesSupportedType.opModExpLimW,
            type: DERType.PhotovoltaicSystem,
            rtgMaxVA: {
                value: 5,
                multiplier: 3,
            },
            rtgMaxVar: {
                value: 5,
                multiplier: 3,
            },
            rtgMaxW: {
                value: 5,
                multiplier: 3,
            },
            rtgVNom: undefined,
        });
    });

    it('should return the correct DERCapabilityResponse for multiple valid nameplateModels', () => {
        const nameplateModels: NameplateModel[] = [
            {
                ARtg: 2080,
                ARtg_SF: -2,
                AhrRtg: null,
                AhrRtg_SF: null,
                DERTyp: 4,
                ID: 120,
                L: 26,
                MaxChaRte: null,
                MaxChaRte_SF: null,
                MaxDisChaRte: null,
                MaxDisChaRte_SF: null,
                PFRtgQ1: -800,
                PFRtgQ2: null,
                PFRtgQ3: null,
                PFRtgQ4: 800,
                PFRtg_SF: -3,
                VARtg: 500,
                VARtg_SF: 1,
                VArRtgQ1: 500,
                VArRtgQ2: null,
                VArRtgQ3: null,
                VArRtgQ4: -500,
                VArRtg_SF: 1,
                WHRtg: null,
                WHRtg_SF: null,
                WRtg: 500,
                WRtg_SF: 1,
            },
            {
                ARtg: 2080,
                ARtg_SF: -2,
                AhrRtg: null,
                AhrRtg_SF: null,
                DERTyp: 4,
                ID: 120,
                L: 26,
                MaxChaRte: null,
                MaxChaRte_SF: null,
                MaxDisChaRte: null,
                MaxDisChaRte_SF: null,
                PFRtgQ1: -800,
                PFRtgQ2: null,
                PFRtgQ3: null,
                PFRtgQ4: 800,
                PFRtg_SF: -3,
                VARtg: 500,
                VARtg_SF: 1,
                VArRtgQ1: 500,
                VArRtgQ2: null,
                VArRtgQ3: null,
                VArRtgQ4: -500,
                VArRtg_SF: 1,
                WHRtg: null,
                WHRtg_SF: null,
                WRtg: 500,
                WRtg_SF: 1,
            },
        ];

        const result: DERCapabilityResponse =
            getDerCapabilityResponseFromSunSpecArray(nameplateModels);

        expect(result).toEqual({
            modesSupported:
                DERControlType.opModEnergize |
                DERControlType.opModMaxLimW |
                DERControlType.opModTargetW,
            doeModesSupported: DOEModesSupportedType.opModExpLimW,
            type: DERType.PhotovoltaicSystem,
            rtgMaxVA: {
                value: 1,
                multiplier: 4,
            },
            rtgMaxVar: {
                value: 1,
                multiplier: 4,
            },
            rtgMaxW: {
                value: 1,
                multiplier: 4,
            },
            rtgVNom: undefined,
        });
    });
});

describe('getConnectStatusFromPVConn', () => {
    it('should return value if inverter is disconnected', () => {
        const result = getConnectStatusFromPVConn(0 as PVConn);

        expect(result).toEqual(0 as ConnectStatus);
    });

    it('should return value if inverter is connected, available, operating', () => {
        const result = getConnectStatusFromPVConn(
            PVConn.AVAILABLE | PVConn.CONNECTED | PVConn.OPERATING,
        );

        expect(result).toEqual(
            ConnectStatus.Available |
                ConnectStatus.Connected |
                ConnectStatus.Operating,
        );
    });
});
