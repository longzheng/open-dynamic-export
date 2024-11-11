import {
    registersToId,
    registersToInt16,
    registersToInt16Nullable,
    registersToSunssf,
    registersToSunssfNullable,
    registersToUint16,
    registersToUint16Nullable,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Settings
 *
 * Inverter Controls Basic Settings
 */
export type SettingsModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 121;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * WMax
     *
     * Setting for maximum power output. Default to WRtg.
     */
    WMax: number;

    /**
     * VRef
     *
     * Voltage at the PCC.
     */
    VRef: number;

    /**
     * VRefOfs
     *
     * Offset from PCC to inverter.
     */
    VRefOfs: number;

    /**
     * VMax
     *
     * Setpoint for maximum voltage.
     */
    VMax: number | null;

    /**
     * VMin
     *
     * Setpoint for minimum voltage.
     */
    VMin: number | null;

    /**
     * VAMax
     *
     * Setpoint for maximum apparent power. Default to VARtg.
     */
    VAMax: number | null;

    /**
     * VArMaxQ1
     *
     * Setting for maximum reactive power in quadrant 1. Default to VArRtgQ1.
     */
    VArMaxQ1: number;

    /**
     * VArMaxQ2
     *
     * Setting for maximum reactive power in quadrant 2. Default to VArRtgQ2.
     */
    VArMaxQ2: number | null;

    /**
     * VArMaxQ3
     *
     * Setting for maximum reactive power in quadrant 3. Default to VArRtgQ3.
     */
    VArMaxQ3: number | null;

    /**
     * VArMaxQ4
     *
     * Setting for maximum reactive power in quadrant 4. Default to VArRtgQ4.
     */
    VArMaxQ4: number;

    /**
     * WGra
     *
     * Default ramp rate of change of active power due to command or internal action.
     */
    WGra: number | null;

    /**
     * PFMinQ1
     *
     * Setpoint for minimum power factor value in quadrant 1. Default to PFRtgQ1.
     */
    PFMinQ1: number;

    /**
     * PFMinQ2
     *
     * Setpoint for minimum power factor value in quadrant 2. Default to PFRtgQ2.
     */
    PFMinQ2: number | null;

    /**
     * PFMinQ3
     *
     * Setpoint for minimum power factor value in quadrant 3. Default to PFRtgQ3.
     */
    PFMinQ3: number | null;

    /**
     * PFMinQ4
     *
     * Setpoint for minimum power factor value in quadrant 4. Default to PFRtgQ4.
     */
    PFMinQ4: number;

    /**
     * VArAct
     *
     * VAR action on change between charging and discharging: 1=switch 2=maintain VAR characterization.
     */
    VArAct: VArAct | null;

    /**
     * ClcTotVA
     *
     * Calculation method for total apparent power. 1=vector 2=arithmetic.
     */
    ClcTotVA: ClcTotVA | null;

    /**
     * MaxRmpRte
     *
     * Setpoint for maximum ramp rate as percentage of nominal maximum ramp rate. This setting will limit the rate that watts delivery to the grid can increase or decrease in response to intermittent PV generation.
     */
    MaxRmpRte: number | null;

    /**
     * ECPNomHz
     *
     * Setpoint for nominal frequency at the ECP.
     */
    ECPNomHz: number | null;

    /**
     * ConnPh
     *
     * Identity of connected phase for single phase inverters. A=1 B=2 C=3.
     */
    ConnPh: ConnPh | null;

    /**
     * WMax_SF
     *
     * Scale factor for real power.
     */
    WMax_SF: number;

    /**
     * VRef_SF
     *
     * Scale factor for voltage at the PCC.
     */
    VRef_SF: number;

    /**
     * VRefOfs_SF
     *
     * Scale factor for offset voltage.
     */
    VRefOfs_SF: number;

    /**
     * VMinMax_SF
     *
     * Scale factor for min/max voltages.
     */
    VMinMax_SF: number | null;

    /**
     * VAMax_SF
     *
     * Scale factor for apparent power.
     */
    VAMax_SF: number | null;

    /**
     * VArMax_SF
     *
     * Scale factor for reactive power.
     */
    VArMax_SF: number | null;

    /**
     * WGra_SF
     *
     * Scale factor for default ramp rate.
     */
    WGra_SF: number | null;

    /**
     * PFMin_SF
     *
     * Scale factor for minimum power factor.
     */
    PFMin_SF: number | null;

    /**
     * MaxRmpRte_SF
     *
     * Scale factor for maximum ramp percentage.
     */
    MaxRmpRte_SF: number | null;

    /**
     * ECPNomHz_SF
     *
     * Scale factor for nominal frequency.
     */
    ECPNomHz_SF: number | null;
};

export const settingsModel = modbusModelFactory<SettingsModel>({
    name: 'settings',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 121),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        WMax: {
            start: 2,
            end: 3,
            readConverter: registersToUint16,
        },
        VRef: {
            start: 3,
            end: 4,
            readConverter: registersToUint16,
        },
        VRefOfs: {
            start: 4,
            end: 5,
            readConverter: registersToUint16,
        },
        VMax: {
            start: 5,
            end: 6,
            readConverter: registersToUint16Nullable,
        },
        VMin: {
            start: 6,
            end: 7,
            readConverter: registersToUint16Nullable,
        },
        VAMax: {
            start: 7,
            end: 8,
            readConverter: registersToUint16Nullable,
        },
        VArMaxQ1: {
            start: 8,
            end: 9,
            readConverter: registersToInt16,
        },
        VArMaxQ2: {
            start: 9,
            end: 10,
            readConverter: registersToInt16Nullable,
        },
        VArMaxQ3: {
            start: 10,
            end: 11,
            readConverter: registersToInt16Nullable,
        },
        VArMaxQ4: {
            start: 11,
            end: 12,
            readConverter: registersToInt16,
        },
        WGra: {
            start: 12,
            end: 13,
            readConverter: registersToUint16Nullable,
        },
        PFMinQ1: {
            start: 13,
            end: 14,
            readConverter: registersToInt16,
        },
        PFMinQ2: {
            start: 14,
            end: 15,
            readConverter: registersToInt16Nullable,
        },
        PFMinQ3: {
            start: 15,
            end: 16,
            readConverter: registersToInt16Nullable,
        },
        PFMinQ4: {
            start: 16,
            end: 17,
            readConverter: registersToInt16,
        },
        VArAct: {
            start: 17,
            end: 18,
            readConverter: registersToUint16Nullable,
        },
        ClcTotVA: {
            start: 18,
            end: 19,
            readConverter: registersToUint16Nullable,
        },
        MaxRmpRte: {
            start: 19,
            end: 20,
            readConverter: registersToUint16Nullable,
        },
        ECPNomHz: {
            start: 20,
            end: 21,
            readConverter: registersToUint16Nullable,
        },
        ConnPh: {
            start: 21,
            end: 22,
            readConverter: registersToUint16Nullable,
        },
        WMax_SF: {
            start: 22,
            end: 23,
            readConverter: registersToSunssf,
        },
        VRef_SF: {
            start: 23,
            end: 24,
            readConverter: registersToSunssf,
        },
        VRefOfs_SF: {
            start: 24,
            end: 25,
            readConverter: registersToSunssf,
        },
        VMinMax_SF: {
            start: 25,
            end: 26,
            readConverter: registersToSunssfNullable,
        },
        VAMax_SF: {
            start: 26,
            end: 27,
            readConverter: registersToSunssfNullable,
        },
        VArMax_SF: {
            start: 27,
            end: 28,
            readConverter: registersToSunssfNullable,
        },
        WGra_SF: {
            start: 28,
            end: 29,
            readConverter: registersToSunssfNullable,
        },
        PFMin_SF: {
            start: 29,
            end: 30,
            readConverter: registersToSunssfNullable,
        },
        MaxRmpRte_SF: {
            start: 30,
            end: 31,
            readConverter: registersToSunssfNullable,
        },
        ECPNomHz_SF: {
            start: 31,
            end: 32,
            readConverter: registersToSunssfNullable,
        },
    },
});

/**
 * VArAct Enumeration
 *
 * Enumerated values representing VAR action on change between charging and discharging.
 */
export enum VArAct {
    SWITCH = 1,
    MAINTAIN = 2,
}

/**
 * ClcTotVA Enumeration
 *
 * Enumerated values representing the calculation method for total apparent power.
 */
export enum ClcTotVA {
    VECTOR = 1,
    ARITHMETIC = 2,
}

/**
 * ConnPh Enumeration
 *
 * Enumerated values representing the identity of connected phase for single phase inverters.
 */
export enum ConnPh {
    A = 1,
    B = 2,
    C = 3,
}
