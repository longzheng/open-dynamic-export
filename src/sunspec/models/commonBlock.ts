import {
    registersToString,
    registersToUint16,
    registersToUint32,
} from '../helpers/converters';
import { sunSpecBlockFactory } from './sunSpecBlockFactory';

export type CommonBlock = {
    // Well-known value. Uniquely identifies this as a SunSpec Modbus Map
    C_SunSpec_ID: number;
    // Length of sunspec model common (1)
    C_SunSpec_DID: number;
    // Length of sunspec model common (1)
    C_SunSpec_Length: number;
    // Manufacturer
    C_Manufacturer: string;
    // Device model
    C_Model: string;
    // Options
    C_Option: string;
    // SW version of inverter
    C_Version: string;
    // Serialnumber of the inverter
    C_SerialNumber: string;
    // Modbus Device Address
    C_DeviceAddress: number;
};

export const commonBlock = sunSpecBlockFactory<CommonBlock>({
    address: {
        start: 40000,
        length: 69,
    },
    mapping: {
        C_SunSpec_ID: {
            start: 0,
            end: 2,
            converter: registersToUint32,
        },
        C_SunSpec_DID: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        C_SunSpec_Length: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        C_Manufacturer: {
            start: 4,
            end: 20,
            converter: registersToString,
        },
        C_Model: {
            start: 20,
            end: 36,
            converter: registersToString,
        },
        C_Option: {
            start: 36,
            end: 44,
            converter: registersToString,
        },
        C_Version: {
            start: 44,
            end: 52,
            converter: registersToString,
        },
        C_SerialNumber: {
            start: 52,
            end: 68,
            converter: registersToString,
        },
        C_DeviceAddress: {
            start: 68,
            end: 69,
            converter: registersToUint16,
        },
    },
});
