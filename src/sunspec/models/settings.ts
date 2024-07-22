import { registersToSunssf, registersToUint16 } from '../helpers/converters';
import type { SunSpecBrand } from './brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type SettingsModel = {
    // Address Offset
    // Model identifier
    // Well-known value. Uniquely identifies this as a sunspec model nameplate
    // 121 is inverter controls basic settings
    ID: number;
    // Model length
    L: number;
    // Setting for maximum power output. Default to WRtg.
    WMax: number;
    // Voltage at the PCC.
    VRef: number;
    // Offset from PCC to inverter.
    VRefOfs: number;
    // Setpoint for maximum voltage.
    VMax: number;
    // Setpoint for minimum voltage.
    VMin: number;
    // Setpoint for maximum apparent power. Default to VARtg.
    VAMax: number;
    // Setting for maximum reactive power in quadrant 1. Default to VArRtgQ1.
    VArMaxQ1: number;
    // Setting for maximum reactive power in quadrant 2. Default to VArRtgQ2.
    VArMaxQ2: number;
    // Setting for maximum reactive power in quadrant 3. Default to VArRtgQ3.
    VArMaxQ3: number;
    // Setting for maximum reactive power in quadrant 4. Default to VArRtgQ4.
    VArMaxQ4: number;
    // Default ramp rate of change of active power due to command or internal action.
    WGra: number;
    // Setpoint for minimum power factor value in quadrant 1. Default to PFRtgQ1.
    PFMinQ1: number;
    // Setpoint for minimum power factor value in quadrant 2. Default to PFRtgQ2.
    PFMinQ2: number;
    // Setpoint for minimum power factor value in quadrant 3. Default to PFRtgQ3.
    PFMinQ3: number;
    // Setpoint for minimum power factor value in quadrant 4. Default to PFRtgQ4.
    PFMinQ4: number;
    // VAR action on change between charging and discharging: 1=switch 2=maintain VAR characterization.
    VArAct: VArAct;
    // Calculation method for total apparent power. 1=vector 2=arithmetic.
    ClcTotVA: ClcTotVA;
    // Setpoint for maximum ramp rate as percentage of nominal maximum ramp rate. This setting will limit the rate that watts delivery to the grid can increase or decrease in response to intermittent PV generation.
    MaxRmpRte: number;
    // Setpoint for nominal frequency at the ECP.
    ECPNomHz: number;
    // Identity of connected phase for single phase inverters. A=1 B=2 C=3.
    ConnPh: ConnPh;
    // Scale factor
    WMax_SF: number;
    // Scale factor
    VRef_SF: number;
    // Scale factor
    VRefOfs_SF: number;
    // Scale factor
    VMinMax_SF: number;
    // Scale factor
    VAMax_SF: number;
    // Scale factor
    VArMax_SF: number;
    // Scale factor
    WGra_SF: number;
    // Scale factor
    PFMin_SF: number;
    // Scale factor
    MaxRmpRte_SF: number;
    // Scale factor
    ECPNomHz_SF: number;
};

export const settingsModel = sunSpecModelFactory<SettingsModel>({
    addressLength: 32,
    mapping: {
        ID: {
            start: 0,
            end: 1,
            converter: registersToUint16,
        },
        L: {
            start: 1,
            end: 2,
            converter: registersToUint16,
        },
        WMax: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        VRef: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        VRefOfs: {
            start: 4,
            end: 5,
            converter: registersToUint16,
        },
        VMax: {
            start: 5,
            end: 6,
            converter: registersToUint16,
        },
        VMin: {
            start: 6,
            end: 7,
            converter: registersToUint16,
        },
        VAMax: {
            start: 7,
            end: 8,
            converter: registersToUint16,
        },
        VArMaxQ1: {
            start: 8,
            end: 9,
            converter: registersToUint16,
        },
        VArMaxQ2: {
            start: 9,
            end: 10,
            converter: registersToUint16,
        },
        VArMaxQ3: {
            start: 10,
            end: 11,
            converter: registersToUint16,
        },
        VArMaxQ4: {
            start: 11,
            end: 12,
            converter: registersToUint16,
        },
        WGra: {
            start: 12,
            end: 13,
            converter: registersToUint16,
        },
        PFMinQ1: {
            start: 13,
            end: 14,
            converter: registersToUint16,
        },
        PFMinQ2: {
            start: 14,
            end: 15,
            converter: registersToUint16,
        },
        PFMinQ3: {
            start: 15,
            end: 16,
            converter: registersToUint16,
        },
        PFMinQ4: {
            start: 16,
            end: 17,
            converter: registersToUint16,
        },
        VArAct: {
            start: 17,
            end: 18,
            converter: registersToUint16,
        },
        ClcTotVA: {
            start: 18,
            end: 19,
            converter: registersToUint16,
        },
        MaxRmpRte: {
            start: 19,
            end: 20,
            converter: registersToUint16,
        },
        ECPNomHz: {
            start: 20,
            end: 21,
            converter: registersToUint16,
        },
        ConnPh: {
            start: 21,
            end: 22,
            converter: registersToUint16,
        },
        WMax_SF: {
            start: 22,
            end: 23,
            converter: registersToSunssf,
        },
        VRef_SF: {
            start: 23,
            end: 24,
            converter: registersToSunssf,
        },
        VRefOfs_SF: {
            start: 24,
            end: 25,
            converter: registersToSunssf,
        },
        VMinMax_SF: {
            start: 25,
            end: 26,
            converter: registersToSunssf,
        },
        VAMax_SF: {
            start: 26,
            end: 27,
            converter: registersToSunssf,
        },
        VArMax_SF: {
            start: 27,
            end: 28,
            converter: registersToSunssf,
        },
        WGra_SF: {
            start: 28,
            end: 29,
            converter: registersToSunssf,
        },
        PFMin_SF: {
            start: 29,
            end: 30,
            converter: registersToSunssf,
        },
        MaxRmpRte_SF: {
            start: 30,
            end: 31,
            converter: registersToSunssf,
        },
        ECPNomHz_SF: {
            start: 31,
            end: 32,
            converter: registersToSunssf,
        },
    },
});

export function settingsModelAddressStartByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return 40149;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}

export enum VArAct {
    SWITCH = 1,
    MAINTAIN = 2,
}

export enum ClcTotVA {
    VECTOR = 1,
    ARITHMETIC = 2,
}

export enum ConnPh {
    A = 1,
    B = 2,
    C = 3,
}
