import {
    registersToUint16,
    registersToUint32,
} from '../../../sunspec/helpers/converters.js';
import { modbusModelFactory } from '../../modbusModelFactory.js';

export type GrowattMeterModels = GrowattMeter1 & GrowattMeter2;

type GrowattMeter1 = {
    // Grid frequency
    Fac: number;
    // Three/single phase grid voltage
    Vac1: number;
    // Three/single phase grid voltage
    Vac2: number;
    // Three/single phase grid voltage
    Vac3: number;
};

type GrowattMeter2 = {
    // AC power to user
    PactouserR: number;
    // AC power to user
    PactouserS: number;
    // AC power to user
    PactouserT: number;
    // AC power to user
    PactouserTotal: number;
    // AC power to grid
    PactogridR: number;
    // AC power to grid
    PactogridS: number;
    // AC power to grid
    PactogridT: number;
    // AC power to grid
    PactogridTotal: number;
};

export const GrowattMeter1Model = modbusModelFactory<GrowattMeter1>({
    name: 'GrowattMeter1Model',
    mapping: {
        Fac: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToUint16(value, -2),
        },
        Vac1: {
            start: 1,
            end: 2,
            readConverter: (value) => registersToUint16(value, -1),
        },
        Vac2: {
            start: 2,
            end: 3,
            readConverter: (value) => registersToUint16(value, -1),
        },
        Vac3: {
            start: 3,
            end: 4,
            readConverter: (value) => registersToUint16(value, -1),
        },
    },
});

export const GrowattMeter2Model = modbusModelFactory<GrowattMeter2>({
    name: 'GrowattMeter2Model',
    mapping: {
        PactouserR: {
            start: 0,
            end: 2,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactouserS: {
            start: 2,
            end: 4,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactouserT: {
            start: 4,
            end: 6,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactouserTotal: {
            start: 6,
            end: 8,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactogridR: {
            start: 8,
            end: 10,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactogridS: {
            start: 10,
            end: 12,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactogridT: {
            start: 12,
            end: 14,
            readConverter: (value) => registersToUint32(value, -1),
        },
        PactogridTotal: {
            start: 14,
            end: 16,
            readConverter: (value) => registersToUint32(value, -1),
        },
    },
});
