import {
    registersToId,
    registersToString,
    registersToStringNullable,
    registersToUint16,
    registersToUint16Nullable,
} from '../helpers/converters.js';
import { sunSpecModelFactory } from './sunSpecModelFactory.js';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type CommonModel = {
    // Length of sunspec model common (1)
    ID: 1;
    // Length of sunspec model common (1)
    L: number;
    // Manufacturer
    Mn: string;
    // Device model
    Md: string;
    // Options
    Opt: string | null;
    // SW version of inverter
    Vr: string | null;
    // Serialnumber of the inverter
    SN: string;
    // Modbus Device Address
    DA: number | null;
};

export const commonModel = sunSpecModelFactory<CommonModel>({
    name: 'common',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 1),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        Mn: {
            start: 2,
            end: 18,
            readConverter: registersToString,
        },
        Md: {
            start: 18,
            end: 34,
            readConverter: registersToString,
        },
        Opt: {
            start: 34,
            end: 42,
            readConverter: registersToStringNullable,
        },
        Vr: {
            start: 42,
            end: 50,
            readConverter: registersToStringNullable,
        },
        SN: {
            start: 50,
            end: 66,
            readConverter: registersToString,
        },
        DA: {
            start: 66,
            end: 67,
            readConverter: registersToUint16Nullable,
        },
    },
});
