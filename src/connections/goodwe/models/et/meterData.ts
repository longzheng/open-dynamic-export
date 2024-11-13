import { modbusModelFactory } from '../../../modbus/modbusModelFactory.js';
import {
    registersToUint32,
    registersToInt32,
    registersToInt16,
    registersToUint16,
} from '../../../modbus/helpers/converters.js';

export type GoodweEtMeterData = {
    // 1: connect correctly,
    // 2: connect reverse（CT)
    // 4:connect incorrectly
    // For example: 0X0124 means Phase R connect incorrectly，Phase S connect reverse, Phase T connect correctly
    bMeterConnectStatus: number;
    // 1: OK, 0: NG
    MeterCommStatus: number;
    // PMeter R
    // If ARM Version>9,please refer to 36019~36041
    MeterActivepowerR: number;
    // PMeter S
    // If ARM Version>9,please refer to 36019~36041
    MeterActivepowerS: number;
    // PMeter T
    // If ARM Version>9,please refer to 36019~36041
    MeterActivepowerT: number;
    // Pmeter
    // If ARM Version>9,please refer to 36019~36041. If three phase meter, it is total power
    MeterTotalActivepower: number;
    // Pmeter reactive power
    // If ARM Version>9,please refer to 36019~36041
    MeterTotalReactivepower: number;
    // Meter power factor R
    MeterPF_R: number;
    // Meter power factor S
    MeterPF_S: number;
    // Meter power factor T
    MeterPF_T: number;
    // Meter power factor
    MeterPowerFactor: number;
    MeterFrequence: number;
    // Total Feed Energy To Grid. Read frommeter
    E_Total_Sell: number;
    // Total Energy From Grid. Read frommeter
    E_Total_Buy: number;
    // ARM>09 Pmeter R
    MeterActivepowerR2: number;
    // ARM>09 Pmeter S
    MeterActivepowerS2: number;
    // ARM>09 Pmeter T
    MeterActivepowerT2: number;
    // ARM>09 Pmeter
    MeterTotalActivepower2: number;
    // Pmeter R Reactive Power
    MeterReactivepowerR: number;
    // Pmeter S Reactive Power
    MeterReactivepowerS: number;
    // Pmeter T Reactive Power
    MeterReactivepowerT: number;
    // Pmeter Reactive Power
    MeterTotalReactivepower2: number;
    // Pmeter R Apparent Power
    MeterApparentpowerR: number;
    // Pmeter S Apparent Power
    MeterApparentpowerS: number;
    // Pmeter T Apparent Power
    MeterApparentpowerT: number;
    // Pmeter Apparent Power
    MeterTotalApparentpower: number;
    // Only for GoodWe Smart Meter (0: Singlephase, 1: 3P3W, 2: 3P4W, 3: HomeKit, 4:
    MeterType: number;
    // Only for GGoMod1W00e0SDm) art Meter
    MeterSoftwareVersion: number;
    // Only for AC Couple inverter. Detect PVinverter
    MeterCT2Activepower: number;
    CT2_E_Total_sell: number;
    CT2_E_Total_buy: number;
    MeterCT2status: number;
    // Phase R voltage frommeter
    meterVoltageR: number;
    // Phase S voltage frommeter
    meterVoltageS: number;
    // Phase T voltage frommeter
    meterVoltageT: number;
    // Phase R current frommeter
    meterCurrentR: number;
    // Phase S current frommeter
    meterCurrentS: number;
    // Phase T current frommeter
    meterCurrentT: number;
};

export const GoodweEtMeterDataModel = modbusModelFactory<GoodweEtMeterData>({
    name: 'GoodweEtMeterDataModel',
    mapping: {
        bMeterConnectStatus: {
            start: 0, // 36003 - 36003
            end: 1,
            readConverter: registersToUint16,
        },
        MeterCommStatus: {
            start: 1, // 36004 - 36003
            end: 2,
            readConverter: registersToUint16,
        },
        MeterActivepowerR: {
            start: 2, // 36005 - 36003
            end: 3,
            readConverter: registersToInt16,
        },
        MeterActivepowerS: {
            start: 3, // 36006 - 36003
            end: 4,
            readConverter: registersToInt16,
        },
        MeterActivepowerT: {
            start: 4, // 36007 - 36003
            end: 5,
            readConverter: registersToInt16,
        },
        MeterTotalActivepower: {
            start: 5, // 36008 - 36003
            end: 6,
            readConverter: registersToInt16,
        },
        MeterTotalReactivepower: {
            start: 6, // 36009 - 36003
            end: 7,
            readConverter: registersToInt16,
        },
        MeterPF_R: {
            start: 7, // 36010 - 36003
            end: 8,
            readConverter: (value) => registersToInt16(value, -2), // /100
        },
        MeterPF_S: {
            start: 8, // 36011 - 36003
            end: 9,
            readConverter: (value) => registersToInt16(value, -2),
        },
        MeterPF_T: {
            start: 9, // 36012 - 36003
            end: 10,
            readConverter: (value) => registersToInt16(value, -2),
        },
        MeterPowerFactor: {
            start: 10, // 36013 - 36003
            end: 11,
            readConverter: (value) => registersToInt16(value, -2),
        },
        MeterFrequence: {
            start: 11, // 36014 - 36003
            end: 12,
            readConverter: (value) => registersToUint16(value, -2),
        },
        E_Total_Sell: {
            start: 12, // 36015 - 36003
            end: 14,
            readConverter: registersToUint32,
        },
        E_Total_Buy: {
            start: 14, // 36017 - 36003
            end: 16,
            readConverter: registersToUint32,
        },
        MeterActivepowerR2: {
            start: 16, // 36019 - 36003
            end: 18,
            readConverter: registersToInt32,
        },
        MeterActivepowerS2: {
            start: 18, // 36021 - 36003
            end: 20,
            readConverter: registersToInt32,
        },
        MeterActivepowerT2: {
            start: 20, // 36023 - 36003
            end: 22,
            readConverter: registersToInt32,
        },
        MeterTotalActivepower2: {
            start: 22, // 36025 - 36003
            end: 24,
            readConverter: registersToInt32,
        },
        MeterReactivepowerR: {
            start: 24, // 36027 - 36003
            end: 26,
            readConverter: registersToInt32,
        },
        MeterReactivepowerS: {
            start: 26, // 36029 - 36003
            end: 28,
            readConverter: registersToInt32,
        },
        MeterReactivepowerT: {
            start: 28, // 36031 - 36003
            end: 30,
            readConverter: registersToInt32,
        },
        MeterTotalReactivepower2: {
            start: 30, // 36033 - 36003
            end: 32,
            readConverter: registersToInt32,
        },
        MeterApparentpowerR: {
            start: 32, // 36035 - 36003
            end: 34,
            readConverter: registersToInt32,
        },
        MeterApparentpowerS: {
            start: 34, // 36037 - 36003
            end: 36,
            readConverter: registersToInt32,
        },
        MeterApparentpowerT: {
            start: 36, // 36039 - 36003
            end: 38,
            readConverter: registersToInt32,
        },
        MeterTotalApparentpower: {
            start: 38, // 36041 - 36003
            end: 40,
            readConverter: registersToInt32,
        },
        MeterType: {
            start: 40, // 36043 - 36003
            end: 41,
            readConverter: registersToUint16,
        },
        MeterSoftwareVersion: {
            start: 41, // 36044 - 36003
            end: 42,
            readConverter: registersToUint16,
        },
        MeterCT2Activepower: {
            start: 42, // 36045 - 36003
            end: 44,
            readConverter: registersToInt32,
        },
        CT2_E_Total_sell: {
            start: 44, // 36047 - 36003
            end: 46,
            readConverter: (value) => registersToUint32(value, -2), // /100
        },
        CT2_E_Total_buy: {
            start: 46, // 36049 - 36003
            end: 48,
            readConverter: (value) => registersToUint32(value, -2), // /100
        },
        MeterCT2status: {
            start: 48, // 36051 - 36003
            end: 49,
            readConverter: registersToUint16,
        },
        meterVoltageR: {
            start: 49, // 36052 - 36003
            end: 50,
            readConverter: (value) => registersToUint16(value, -1), // /10
        },
        meterVoltageS: {
            start: 50, // 36053 - 36003
            end: 51,
            readConverter: (value) => registersToUint16(value, -1), // /10
        },
        meterVoltageT: {
            start: 51, // 36054 - 36003
            end: 52,
            readConverter: (value) => registersToUint16(value, -1), // /10
        },
        meterCurrentR: {
            start: 52, // 36055 - 36003
            end: 53,
            readConverter: (value) => registersToUint16(value, -1), // /10
        },
        meterCurrentS: {
            start: 53, // 36056 - 36003
            end: 54,
            readConverter: (value) => registersToUint16(value, -1), // /10
        },
        meterCurrentT: {
            start: 54, // 36057 - 36003
            end: 55,
            readConverter: (value) => registersToUint16(value, -1), // /10
        },
    },
});
