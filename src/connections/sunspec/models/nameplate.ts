import {
    registersToUint16,
    registersToSunssf,
    registersToInt16,
    registersToUint16Nullable,
    registersToSunssfNullable,
    registersToInt16Nullable,
    registersToId,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Nameplate
 *
 * Inverter Controls Nameplate Ratings
 */
export type NameplateModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 120;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * Type of DER device
     *
     * Type of DER device. Default value is 4 to indicate PV device.
     */
    DERTyp: DERTyp;

    /**
     * WRtg
     *
     * Continuous power output capability of the inverter.
     */
    WRtg: number;

    /**
     * WRtg_SF
     *
     * Scale factor
     */
    WRtg_SF: number;

    /**
     * VARtg
     *
     * Continuous Volt-Ampere capability of the inverter.
     */
    VARtg: number;

    /**
     * VARtg_SF
     *
     * Scale factor
     */
    VARtg_SF: number;

    /**
     * VArRtgQ1
     *
     * Continuous VAR capability of the inverter in quadrant 1.
     */
    VArRtgQ1: number;

    /**
     * VArRtgQ2
     *
     * Continuous VAR capability of the inverter in quadrant 2.
     */
    VArRtgQ2: number | null;

    /**
     * VArRtgQ3
     *
     * Continuous VAR capability of the inverter in quadrant 3.
     */
    VArRtgQ3: number | null;

    /**
     * VArRtgQ4
     *
     * Continuous VAR capability of the inverter in quadrant 4.
     */
    VArRtgQ4: number;

    /**
     * VArRtg_SF
     *
     * Scale factor
     */
    VArRtg_SF: number;

    /**
     * ARtg
     *
     * Maximum RMS AC current level capability of the inverter.
     */
    ARtg: number;

    /**
     * ARtg_SF
     *
     * Scale factor
     */
    ARtg_SF: number;

    /**
     * PFRtgQ1
     *
     * Minimum power factor capability of the inverter in quadrant 1.
     */
    PFRtgQ1: number;

    /**
     * PFRtgQ2
     *
     * Minimum power factor capability of the inverter in quadrant 2.
     */
    PFRtgQ2: number | null;

    /**
     * PFRtgQ3
     *
     * Minimum power factor capability of the inverter in quadrant 3.
     */
    PFRtgQ3: number | null;

    /**
     * PFRtgQ4
     *
     * Minimum power factor capability of the inverter in quadrant 4.
     */
    PFRtgQ4: number;

    /**
     * PFRtg_SF
     *
     * Scale factor
     */
    PFRtg_SF: number;

    /**
     * WHRtg
     *
     * Nominal energy rating of storage device.
     */
    WHRtg: number | null;

    /**
     * WHRtg_SF
     *
     * Scale factor
     */
    WHRtg_SF: number | null;

    /**
     * AhrRtg
     *
     * The usable capacity of the battery. Maximum charge minus minimum charge from a technology capability perspective (Amp-hour capacity rating).
     */
    AhrRtg: number | null;

    /**
     * AhrRtg_SF
     *
     * Scale factor
     */
    AhrRtg_SF: number | null;

    /**
     * MaxChaRte
     *
     * Maximum rate of energy transfer into the storage device.
     */
    MaxChaRte: number | null;

    /**
     * MaxChaRte_SF
     *
     * Scale factor
     */
    MaxChaRte_SF: number | null;

    /**
     * MaxDisChaRte
     *
     * Maximum rate of energy transfer out of the storage device.
     */
    MaxDisChaRte: number | null;

    /**
     * MaxDisChaRte_SF
     *
     * Scale factor
     */
    MaxDisChaRte_SF: number | null;
};

export const nameplateModel = modbusModelFactory<NameplateModel>({
    name: 'nameplate',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 120),
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
            readConverter: registersToInt16Nullable,
        },
        VArRtgQ3: {
            start: 9,
            end: 10,
            readConverter: registersToInt16Nullable,
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
            readConverter: registersToInt16Nullable,
        },
        PFRtgQ3: {
            start: 16,
            end: 17,
            readConverter: registersToInt16Nullable,
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

/**
 * Type of DER device Enumeration
 *
 * Enumerated values representing the type of DER device.
 */
export enum DERTyp {
    PV = 4,
    PV_STOR = 82,
}
