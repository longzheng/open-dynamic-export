import {
    registersToString,
    registersToUint16,
    registersToUint32,
} from '../helpers/converters';
import { sunSpecBlockFactory } from './sunSpecBlockFactory';

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

export const commonBlock = sunSpecBlockFactory<CommonBlock>({
    address: {
        start: 40000,
        length: 69,
    },
    mapping: {
        SID: {
            start: 0,
            end: 2,
            converter: registersToUint32,
        },
        ID: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        L: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        Mn: {
            start: 4,
            end: 20,
            converter: registersToString,
        },
        Md: {
            start: 20,
            end: 36,
            converter: registersToString,
        },
        Opt: {
            start: 36,
            end: 44,
            converter: registersToString,
        },
        Vr: {
            start: 44,
            end: 52,
            converter: registersToString,
        },
        SN: {
            start: 52,
            end: 68,
            converter: registersToString,
        },
        DA: {
            start: 68,
            end: 69,
            converter: registersToUint16,
        },
    },
});
