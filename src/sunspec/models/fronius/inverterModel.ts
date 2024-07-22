import {
    registersToAcc32,
    registersToInt16,
    registersToSunssf,
    registersToUint16,
    registersToUint32,
} from '../../helpers/converters';
import type { InverterModel } from '../inverterModel';
import { sunSpecModelFactory } from '../sunSpecModelFactory';

export const froniusInverterModel = sunSpecModelFactory<InverterModel>({
    address: {
        start: 40069,
        length: 52,
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
        A: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        AphA: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        AphB: {
            start: 4,
            end: 5,
            converter: registersToUint16,
        },
        AphC: {
            start: 5,
            end: 6,
            converter: registersToUint16,
        },
        A_SF: {
            start: 6,
            end: 7,
            converter: registersToSunssf,
        },
        PPVphAB: {
            start: 7,
            end: 8,
            converter: registersToUint16,
        },
        PPVphBC: {
            start: 8,
            end: 9,
            converter: registersToUint16,
        },
        PPVphCA: {
            start: 9,
            end: 10,
            converter: registersToUint16,
        },
        PhVphA: {
            start: 10,
            end: 11,
            converter: registersToUint16,
        },
        PhVphB: {
            start: 11,
            end: 12,
            converter: registersToUint16,
        },
        PhVphC: {
            start: 12,
            end: 13,
            converter: registersToUint16,
        },
        V_SF: {
            start: 13,
            end: 14,
            converter: registersToSunssf,
        },
        W: {
            start: 14,
            end: 15,
            converter: registersToInt16,
        },
        W_SF: {
            start: 15,
            end: 16,
            converter: registersToSunssf,
        },
        Hz: {
            start: 16,
            end: 17,
            converter: registersToUint16,
        },
        Hz_SF: {
            start: 17,
            end: 18,
            converter: registersToSunssf,
        },
        VA: {
            start: 18,
            end: 19,
            converter: registersToInt16,
        },
        VA_SF: {
            start: 19,
            end: 20,
            converter: registersToSunssf,
        },
        VAr: {
            start: 20,
            end: 21,
            converter: registersToInt16,
        },
        VAr_SF: {
            start: 21,
            end: 22,
            converter: registersToSunssf,
        },
        PF: {
            start: 22,
            end: 23,
            converter: registersToInt16,
        },
        PF_SF: {
            start: 23,
            end: 24,
            converter: registersToSunssf,
        },
        WH: {
            start: 24,
            end: 26,
            converter: registersToAcc32,
        },
        WH_SF: {
            start: 26,
            end: 27,
            converter: registersToSunssf,
        },
        DCA: {
            start: 27,
            end: 28,
            converter: registersToUint16,
        },
        DCA_SF: {
            start: 28,
            end: 29,
            converter: registersToSunssf,
        },
        DCV: {
            start: 29,
            end: 30,
            converter: registersToUint16,
        },
        DCV_SF: {
            start: 30,
            end: 31,
            converter: registersToSunssf,
        },
        DCW: {
            start: 31,
            end: 32,
            converter: registersToInt16,
        },
        DCW_SF: {
            start: 32,
            end: 33,
            converter: registersToSunssf,
        },
        TmpCab: {
            start: 33,
            end: 34,
            converter: registersToInt16,
        },
        TmpSnk: {
            start: 34,
            end: 35,
            converter: registersToInt16,
        },
        TmpTrns: {
            start: 35,
            end: 36,
            converter: registersToInt16,
        },
        TmpOt: {
            start: 36,
            end: 37,
            converter: registersToInt16,
        },
        Tmp_SF: {
            start: 37,
            end: 38,
            converter: registersToSunssf,
        },
        St: {
            start: 38,
            end: 39,
            converter: registersToUint16,
        },
        StVnd: {
            start: 39,
            end: 40,
            converter: registersToUint16,
        },
        Evt1: {
            start: 40,
            end: 42,
            converter: registersToUint32,
        },
        Evt2: {
            start: 42,
            end: 44,
            converter: registersToUint32,
        },
        EvtVnd1: {
            start: 44,
            end: 46,
            converter: registersToUint32,
        },
        EvtVnd2: {
            start: 46,
            end: 48,
            converter: registersToUint32,
        },
        EvtVnd3: {
            start: 48,
            end: 50,
            converter: registersToUint32,
        },
        EvtVnd4: {
            start: 50,
            end: 52,
            converter: registersToUint32,
        },
    },
});
