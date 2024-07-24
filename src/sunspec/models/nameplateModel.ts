import {
    registersToUint16,
    registersToSunssf,
    registersToInt16,
    registersToUint16Nullable,
    registersToSunssfNullable,
} from '../helpers/converters';
import type { SunSpecBrand } from './brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type NameplateModel = {
    // Model identifier
    // Well-known value. Uniquely identifies this as a sunspec model nameplate
    // 120 is nameplate
    ID: number;
    // Model length
    L: number;
    // Type of DER device. Default value is 4 to indicate PV device.
    DERTyp: DERType;
    // Continuous power output capability of the inverter.
    WRtg: number;
    // Scale factor
    WRtg_SF: number;
    // Continuous Volt-Ampere capability of the inverter.
    VARtg: number;
    // Scale factor
    VARtg_SF: number;
    // Continuous VAR capability of the inverter in quadrant 1.
    VArRtgQ1: number;
    // Continuous VAR capability of the inverter in quadrant 2.
    VArRtgQ2: number;
    // Continuous VAR capability of the inverter in quadrant 3.
    VArRtgQ3: number;
    // Continuous VAR capability of the inverter in quadrant 4.
    VArRtgQ4: number;
    // Scale factor
    VArRtg_SF: number;
    // Maximum RMS AC current level capability of the inverter.
    ARtg: number;
    // Scale factor
    ARtg_SF: number;
    // Minimum power factor capability of the inverter in quadrant 1.
    PFRtgQ1: number;
    // Minimum power factor capability of the inverter in quadrant 2.
    PFRtgQ2: number;
    // Minimum power factor capability of the inverter in quadrant 3.
    PFRtgQ3: number;
    // Minimum power factor capability of the inverter in quadrant 4.
    PFRtgQ4: number;
    // Scale factor
    PFRtg_SF: number;
    // Nominal energy rating of storage device.
    WHRtg: number | null;
    // Scale factor
    WHRtg_SF: number | null;
    // The usable capacity of the battery.  Maximum charge minus minimum charge from a technology capability perspective (Amp-hour capacity rating).
    AhrRtg: number | null;
    // Scale factor
    AhrRtg_SF: number | null;
    // Maximum rate of energy transfer into the storage device.
    MaxChaRte: number | null;
    // Scale factor
    MaxChaRte_SF: number | null;
    // Maximum rate of energy transfer out of the storage device.
    MaxDisChaRte: number | null;
    // Scale factor
    MaxDisChaRte_SF: number | null;
};

export const nameplateModel = sunSpecModelFactory<NameplateModel>({
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: registersToUint16,
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        DERTyp: {
            start: 2,
            end: 3,
            readConverter: registersToUint16,
        },
        WRtg: {
            start: 3,
            end: 4,
            readConverter: registersToUint16,
        },
        WRtg_SF: {
            start: 4,
            end: 5,
            readConverter: registersToSunssf,
        },
        VARtg: {
            start: 5,
            end: 6,
            readConverter: registersToUint16,
        },
        VARtg_SF: {
            start: 6,
            end: 7,
            readConverter: registersToSunssf,
        },
        VArRtgQ1: {
            start: 7,
            end: 8,
            readConverter: registersToInt16,
        },
        VArRtgQ2: {
            start: 8,
            end: 9,
            readConverter: registersToInt16,
        },
        VArRtgQ3: {
            start: 9,
            end: 10,
            readConverter: registersToInt16,
        },
        VArRtgQ4: {
            start: 10,
            end: 11,
            readConverter: registersToInt16,
        },
        VArRtg_SF: {
            start: 11,
            end: 12,
            readConverter: registersToSunssf,
        },
        ARtg: {
            start: 12,
            end: 13,
            readConverter: registersToUint16,
        },
        ARtg_SF: {
            start: 13,
            end: 14,
            readConverter: registersToSunssf,
        },
        PFRtgQ1: {
            start: 14,
            end: 15,
            readConverter: registersToInt16,
        },
        PFRtgQ2: {
            start: 15,
            end: 16,
            readConverter: registersToInt16,
        },
        PFRtgQ3: {
            start: 16,
            end: 17,
            readConverter: registersToInt16,
        },
        PFRtgQ4: {
            start: 17,
            end: 18,
            readConverter: registersToInt16,
        },
        PFRtg_SF: {
            start: 18,
            end: 19,
            readConverter: registersToSunssf,
        },
        WHRtg: {
            start: 19,
            end: 20,
            readConverter: registersToUint16Nullable,
        },
        WHRtg_SF: {
            start: 20,
            end: 21,
            readConverter: registersToSunssfNullable,
        },
        AhrRtg: {
            start: 21,
            end: 22,
            readConverter: registersToUint16Nullable,
        },
        AhrRtg_SF: {
            start: 22,
            end: 23,
            readConverter: registersToSunssfNullable,
        },
        MaxChaRte: {
            start: 23,
            end: 24,
            readConverter: registersToUint16Nullable,
        },
        MaxChaRte_SF: {
            start: 24,
            end: 25,
            readConverter: registersToSunssfNullable,
        },
        MaxDisChaRte: {
            start: 25,
            end: 26,
            readConverter: registersToUint16Nullable,
        },
        MaxDisChaRte_SF: {
            start: 26,
            end: 27,
            readConverter: registersToSunssfNullable,
        },
    },
});

export function nameplateModelAddressStartByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return 40121;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}

export enum DERType {
    PV = 4,
    PV_STOR = 82,
}
