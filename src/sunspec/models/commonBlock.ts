import {
    registersToString,
    registersToUint16,
    registersToUint32,
} from '../helpers/registers';

export type CommonBlock = {
    // Well-known value. Uniquely identifies this as a SunSpec Modbus Map
    SID: number;
    // Length of sunspec model common (1)
    ID: number;
    // Length of sunspec model common (1)
    L: number;
    // Manufacturer
    Mn: string;
    // Device model
    Md: string;
    // Options
    Opt: string;
    // SW version of inverter
    Vr: string;
    // Serialnumber of the inverter
    SN: string;
    // Modbus Device Address
    DA: number;
};

export function parseCommonBlock(registers: number[]): CommonBlock {
    if (registers.length !== 69) {
        throw new Error('Invalid length');
    }

    const SID = registersToUint32(registers.slice(0, 2));

    // SID is a well-known value. Uniquely identifies this as a SunSpec Modbus Map
    // assert this is the case or this isn't SunSpec
    // 0x53756e53 ('SunS')
    if (SID !== 0x53756e53) {
        throw new Error('Not a SunSpec device');
    }

    return {
        // Well-known value. Uniquely identifies this as a SunSpec Modbus Map
        SID,
        // Length of sunspec model common (1)
        ID: registersToUint16(registers.slice(2, 3)),
        // Length of sunspec model common (1)
        L: registersToUint16(registers.slice(3, 4)),
        // Manufacturer
        Mn: registersToString(registers.slice(4, 20)),
        // Device model
        Md: registersToString(registers.slice(20, 36)),
        // Options
        Opt: registersToString(registers.slice(36, 44)),
        // SW version of inverter
        Vr: registersToString(registers.slice(44, 52)),
        // Serialnumber of the inverter
        SN: registersToString(registers.slice(52, 68)),
        // Modbus Device Address
        DA: registersToUint16(registers.slice(68, 69)),
    };
}
