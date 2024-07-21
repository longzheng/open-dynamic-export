import {
    registersToAcc32,
    registersToInt16,
    registersToSunssf,
    registersToUint16,
    registersToUint32,
} from '../../helpers/converters';
import type { InverterBlock } from '../inverterBlock';
import { sunSpecBlockFactory } from '../sunSpecBlockFactory';

export const froniusInverterBlock = sunSpecBlockFactory<InverterBlock>({
    address: {
        start: 40069,
        length: 52,
    },
    mapping: {
        C_SunSpec_DID: {
            start: 0,
            end: 1,
            converter: registersToUint16,
        },
        C_SunSpec_Length: {
            start: 1,
            end: 2,
            converter: registersToUint16,
        },
        I_AC_Current: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        I_AC_CurrentA: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        I_AC_CurrentB: {
            start: 4,
            end: 5,
            converter: registersToUint16,
        },
        I_AC_CurrentC: {
            start: 5,
            end: 6,
            converter: registersToUint16,
        },
        I_AC_Current_SF: {
            start: 6,
            end: 7,
            converter: registersToSunssf,
        },
        I_AC_VoltageAB: {
            start: 7,
            end: 8,
            converter: registersToUint16,
        },
        I_AC_VoltageBC: {
            start: 8,
            end: 9,
            converter: registersToUint16,
        },
        I_AC_VoltageCA: {
            start: 9,
            end: 10,
            converter: registersToUint16,
        },
        I_AC_VoltageAN: {
            start: 10,
            end: 11,
            converter: registersToUint16,
        },
        I_AC_VoltageBN: {
            start: 11,
            end: 12,
            converter: registersToUint16,
        },
        I_AC_VoltageCN: {
            start: 12,
            end: 13,
            converter: registersToUint16,
        },
        I_AC_Voltage_SF: {
            start: 13,
            end: 14,
            converter: registersToSunssf,
        },
        I_AC_Power: {
            start: 14,
            end: 15,
            converter: registersToInt16,
        },
        I_AC_Power_SF: {
            start: 15,
            end: 16,
            converter: registersToSunssf,
        },
        I_AC_Frequency: {
            start: 16,
            end: 17,
            converter: registersToUint16,
        },
        I_AC_Frequency_SF: {
            start: 17,
            end: 18,
            converter: registersToSunssf,
        },
        I_AC_VA: {
            start: 18,
            end: 19,
            converter: registersToInt16,
        },
        I_AC_VA_SF: {
            start: 19,
            end: 20,
            converter: registersToSunssf,
        },
        I_AC_VAR: {
            start: 20,
            end: 21,
            converter: registersToInt16,
        },
        I_AC_VAR_SF: {
            start: 21,
            end: 22,
            converter: registersToSunssf,
        },
        I_AC_PF: {
            start: 22,
            end: 23,
            converter: registersToInt16,
        },
        I_AC_PF_SF: {
            start: 23,
            end: 24,
            converter: registersToSunssf,
        },
        I_AC_Energy_WH: {
            start: 24,
            end: 26,
            converter: registersToAcc32,
        },
        I_AC_Energy_WH_SF: {
            start: 26,
            end: 27,
            converter: registersToSunssf,
        },
        I_DC_Current: {
            start: 27,
            end: 28,
            converter: registersToUint16,
        },
        I_DC_Current_SF: {
            start: 28,
            end: 29,
            converter: registersToSunssf,
        },
        I_DC_Voltage: {
            start: 29,
            end: 30,
            converter: registersToUint16,
        },
        I_DC_Voltage_SF: {
            start: 30,
            end: 31,
            converter: registersToSunssf,
        },
        I_DC_Power: {
            start: 31,
            end: 32,
            converter: registersToInt16,
        },
        I_DC_Power_SF: {
            start: 32,
            end: 33,
            converter: registersToSunssf,
        },
        I_Temp_Cab: {
            start: 33,
            end: 34,
            converter: registersToInt16,
        },
        I_Temp_Sink: {
            start: 34,
            end: 35,
            converter: registersToInt16,
        },
        I_Temp_Trans: {
            start: 35,
            end: 36,
            converter: registersToInt16,
        },
        I_Temp_Other: {
            start: 36,
            end: 37,
            converter: registersToInt16,
        },
        I_Temp_SF: {
            start: 37,
            end: 38,
            converter: registersToSunssf,
        },
        I_Status: {
            start: 38,
            end: 39,
            converter: registersToUint16,
        },
        I_Status_Vendor: {
            start: 39,
            end: 40,
            converter: registersToUint16,
        },
        I_Event_1: {
            start: 40,
            end: 42,
            converter: registersToUint32,
        },
        I_Event_2: {
            start: 42,
            end: 44,
            converter: registersToUint32,
        },
        I_Event_1_Vendor: {
            start: 44,
            end: 46,
            converter: registersToUint32,
        },
        I_Event_2_Vendor: {
            start: 46,
            end: 48,
            converter: registersToUint32,
        },
        I_Event_3_Vendor: {
            start: 48,
            end: 50,
            converter: registersToUint32,
        },
        I_Event_4_Vendor: {
            start: 50,
            end: 52,
            converter: registersToUint32,
        },
    },
});
