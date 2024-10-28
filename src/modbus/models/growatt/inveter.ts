import {
    registersToUint16,
    registersToUint32,
} from '../../helpers/converters.js';
import { modbusModelFactory } from '../../modbusModelFactory.js';

export type GrowattInverterModels = GrowattInverter1;

type GrowattInverter1 = {
    // Inverter run state
    // 0:waiting, 1:normal, 3:fault
    InverterStatus: number;
    // Input power
    Ppv: number;
};

export const GrowattInveter1Model = modbusModelFactory<GrowattInverter1>({
    name: 'GrowattInveter1Model',
    type: 'input',
    mapping: {
        InverterStatus: {
            start: 0,
            end: 1,
            readConverter: registersToUint16,
        },
        Ppv: {
            start: 1,
            end: 3,
            readConverter: (value) => registersToUint32(value, -1),
        },
    },
});
