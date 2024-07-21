import type { SunSpecBrand } from './brand';
import { froniusInverterBlock } from './fronius/froniusInverterBlock';

// https://sunspec.org/wp-content/uploads/2015/06/SunSpec-Specification-Inverter-Monitoring-Models-A12020-1.3.pdf
export type InverterBlock = {
    // Uniquely identifies this as a SunSpec Inverter Modbus Map; 101: single phase, 102: split phase 103: three phase
    C_SunSpec_DID: number;
    // Length of model block
    C_SunSpec_Length: number;
    // Measured AC Total Current value
    I_AC_Current: number;
    // Measured AC Phase- A Current value
    I_AC_CurrentA: number;
    // Measured AC Phase- B Current value
    I_AC_CurrentB: number;
    // Measured AC Phase- C Current value
    I_AC_CurrentC: number;
    // AC Current Scale factor
    I_AC_Current_SF: number;
    // Measured AC Voltage Phase-AB value
    I_AC_VoltageAB: number;
    // Measured AC Voltage Phase BC value
    I_AC_VoltageBC: number;
    // Measured AC Voltage Phase CA value
    I_AC_VoltageCA: number;
    // Measured AC Voltage Phase-A- to-neutral value
    I_AC_VoltageAN: number;
    // Measured AC Voltage Phase B-to- neutral value
    I_AC_VoltageBN: number;
    // Measured AC Voltage Phase C- to-neutral
    I_AC_VoltageCN: number;
    // AC Voltage Scale factor
    I_AC_Voltage_SF: number;
    // Measured AC Power
    I_AC_Power: number;
    // AC Power Scale factor
    I_AC_Power_SF: number;
    // Measured AC Frequency
    I_AC_Frequency: number;
    // AC Frequency Scale factor
    I_AC_Frequency_SF: number;
    // Measured Apparent Power
    I_AC_VA: number;
    // Apparent Power Scale factor
    I_AC_VA_SF: number;
    // Measured Reactive Power
    I_AC_VAR: number;
    // Reactive Power Scale factor
    I_AC_VAR_SF: number;
    // Measured Power Factor
    I_AC_PF: number;
    // Power Factor Scale factor
    I_AC_PF_SF: number;
    // AC Lifetime WattHour Energy
    I_AC_Energy_WH: number;
    // AC Lifetime Energy Scale factor
    I_AC_Energy_WH_SF: number;
    // Measured DC Current
    I_DC_Current: number;
    // DC Current Scale factor
    I_DC_Current_SF: number;
    // Measured DC Voltage
    I_DC_Voltage: number;
    // DC Voltage Scale factor
    I_DC_Voltage_SF: number;
    // Measured DC Power
    I_DC_Power: number;
    // DC Power Scale factor
    I_DC_Power_SF: number;
    // Measured Cabinet Temperature
    I_Temp_Cab: number;
    // Measured Coolant or Heat Sink Temperature
    I_Temp_Sink: number;
    // Measured Transformer Temperature
    I_Temp_Trans: number;
    // Measured Other Temperature
    I_Temp_Other: number;
    // Temperature Scale factor
    I_Temp_SF: number;
    // Descriptive Operating State
    I_Status: number;
    // Descriptive Vendor Defined Operating State
    I_Status_Vendor: number;
    // Descriptive Event Flags (bits 0-31)
    I_Event_1: number;
    // Descriptive Event Flags (bits 32-63)
    I_Event_2: number;
    // Descriptive Vendor Defined Event Flags (bits 0-31)
    I_Event_1_Vendor: number;
    // Descriptive Vendor Defined Event Flags (bits 32-63)
    I_Event_2_Vendor: number;
    // Descriptive Vendor Defined Event Flags (bits 64-95)
    I_Event_3_Vendor: number;
    // Descriptive Vendor Defined Event Flags (bits 96- 127)
    I_Event_4_Vendor: number;
};

export function getInverterBlockByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return froniusInverterBlock;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}
