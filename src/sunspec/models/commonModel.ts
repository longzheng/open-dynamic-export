import {
    registersToString,
    registersToUint16,
    registersToUint32,
} from '../helpers/converters';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type CommonModel = {
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

export const commonModel = sunSpecModelFactory<CommonModel>({
    mapping: {
        SID: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
        ID: {
            start: 2,
            end: 3,
            readConverter: registersToUint16,
        },
        L: {
            start: 3,
            end: 4,
            readConverter: registersToUint16,
        },
        Mn: {
            start: 4,
            end: 20,
            readConverter: registersToString,
        },
        Md: {
            start: 20,
            end: 36,
            readConverter: registersToString,
        },
        Opt: {
            start: 36,
            end: 44,
            readConverter: registersToString,
        },
        Vr: {
            start: 44,
            end: 52,
            readConverter: registersToString,
        },
        SN: {
            start: 52,
            end: 68,
            readConverter: registersToString,
        },
        DA: {
            start: 68,
            end: 69,
            readConverter: registersToUint16,
        },
    },
});
