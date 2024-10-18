import { modbusModelFactory } from '../modbusModelFactory.js';
import {
    registersToInt32,
    registersToUint32,
} from '../../sunspec/helpers/converters.js';

export type SmaCore1InverterModels = SmaCore1Inverter1 & SmaCore1Inverter2;

type SmaCore1Inverter1 = {
    // Maximum active power device
    WLim: number;
};

type SmaCore1Inverter2 = {
    // Rated apparent power VAMaxOutRtg
    VAMaxOutRtg: number;
    // Rated apparent power VAMaxInRtg
    VAMaxInRtg: number;
    // Rated reactive power VArMaxQ1Rtg
    VArMaxQ1Rtg: number;
    // Rated reactive power VArMaxQ2Rtg
    VArMaxQ2Rtg: number;
    // Rated reactive power VArMaxQ3Rtg
    VArMaxQ3Rtg: number;
    // Rated reactive power VArMaxQ4Rtg
    VArMaxQ4Rtg: number;
    // Rated cos φ PFMinQ1Rtg
    PFMinQ1Rtg: number;
    // Rated cos φ PFMinQ2Rtg
    PFMinQ2Rtg: number;
    // Rated cos φ PFMinQ3Rtg
    PFMinQ3Rtg: number;
    // Rated cos φ PFMinQ4Rtg
    PFMinQ4Rtg: number;
};

export const SmaCore1Inverter1Model = modbusModelFactory<SmaCore1Inverter1>({
    name: 'SmaCore1Inverter1Model',
    mapping: {
        WLim: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
    },
});

export const SmaCore1Inverter2Model = modbusModelFactory<SmaCore1Inverter2>({
    name: 'SmaCore1Inverter2Model',
    mapping: {
        VAMaxOutRtg: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
        VAMaxInRtg: {
            start: 2,
            end: 4,
            readConverter: registersToUint32,
        },
        VArMaxQ1Rtg: {
            start: 4,
            end: 6,
            readConverter: registersToInt32,
        },
        VArMaxQ2Rtg: {
            start: 6,
            end: 8,
            readConverter: registersToInt32,
        },
        VArMaxQ3Rtg: {
            start: 8,
            end: 10,
            readConverter: registersToInt32,
        },
        VArMaxQ4Rtg: {
            start: 10,
            end: 12,
            readConverter: registersToInt32,
        },
        PFMinQ1Rtg: {
            start: 12,
            end: 14,
            readConverter: (value) => registersToUint32(value, -4),
        },
        PFMinQ2Rtg: {
            start: 14,
            end: 16,
            readConverter: (value) => registersToUint32(value, -4),
        },
        PFMinQ3Rtg: {
            start: 16,
            end: 18,
            readConverter: (value) => registersToUint32(value, -4),
        },
        PFMinQ4Rtg: {
            start: 18,
            end: 20,
            readConverter: (value) => registersToUint32(value, -4),
        },
    },
});
