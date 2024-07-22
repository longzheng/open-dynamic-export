import type { SunSpecBrand } from './brand';
import { froniusNameplateModel } from './fronius/nameplateModel';

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
    WHRtg: number;
    // Scale factor
    WHRtg_SF: number;
    // The usable capacity of the battery.  Maximum charge minus minimum charge from a technology capability perspective (Amp-hour capacity rating).
    AhrRtg: number;
    // Scale factor
    AhrRtg_SF: number;
    // Maximum rate of energy transfer into the storage device.
    MaxChaRte: number;
    // Scale factor
    MaxChaRte_SF: number;
    // Maximum rate of energy transfer out of the storage device.
    MaxDisChaRte: number;
    // Scale factor
    MaxDisChaRte_SF: number;
};

export function getNameplateModelByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return froniusNameplateModel;
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
