import {
    registersToInt16,
    registersToSunssf,
    registersToUint16,
} from '../../helpers/converters';
import type { NameplateModel } from '../nameplateModel';
import { sunSpecModelFactory } from '../sunSpecModelFactory';

export const froniusNameplateModel = sunSpecModelFactory<NameplateModel>({
    address: {
        start: 40121,
        length: 27,
    },
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
        DERTyp: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        WRtg: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        WRtg_SF: {
            start: 4,
            end: 5,
            converter: registersToSunssf,
        },
        VARtg: {
            start: 5,
            end: 6,
            converter: registersToUint16,
        },
        VARtg_SF: {
            start: 6,
            end: 7,
            converter: registersToSunssf,
        },
        VArRtgQ1: {
            start: 7,
            end: 8,
            converter: registersToInt16,
        },
        VArRtgQ2: {
            start: 8,
            end: 9,
            converter: registersToInt16,
        },
        VArRtgQ3: {
            start: 9,
            end: 10,
            converter: registersToInt16,
        },
        VArRtgQ4: {
            start: 10,
            end: 11,
            converter: registersToInt16,
        },
        VArRtg_SF: {
            start: 11,
            end: 12,
            converter: registersToSunssf,
        },
        ARtg: {
            start: 12,
            end: 13,
            converter: registersToUint16,
        },
        ARtg_SF: {
            start: 13,
            end: 14,
            converter: registersToSunssf,
        },
        PFRtgQ1: {
            start: 14,
            end: 15,
            converter: registersToInt16,
        },
        PFRtgQ2: {
            start: 15,
            end: 16,
            converter: registersToInt16,
        },
        PFRtgQ3: {
            start: 16,
            end: 17,
            converter: registersToInt16,
        },
        PFRtgQ4: {
            start: 17,
            end: 18,
            converter: registersToInt16,
        },
        PFRtg_SF: {
            start: 18,
            end: 19,
            converter: registersToSunssf,
        },
        WHRtg: {
            start: 19,
            end: 20,
            converter: registersToUint16,
        },
        WHRtg_SF: {
            start: 20,
            end: 21,
            converter: registersToSunssf,
        },
        AhrRtg: {
            start: 21,
            end: 22,
            converter: registersToUint16,
        },
        AhrRtg_SF: {
            start: 22,
            end: 23,
            converter: registersToSunssf,
        },
        MaxChaRte: {
            start: 23,
            end: 24,
            converter: registersToUint16,
        },
        MaxChaRte_SF: {
            start: 24,
            end: 25,
            converter: registersToSunssf,
        },
        MaxDisChaRte: {
            start: 25,
            end: 26,
            converter: registersToUint16,
        },
        MaxDisChaRte_SF: {
            start: 26,
            end: 27,
            converter: registersToSunssf,
        },
    },
});
