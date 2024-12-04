import {
    registersToUint16,
    uint16ToRegisters,
} from '../../helpers/converters.js';
import { modbusModelFactory } from '../../modbusModelFactory.js';

export type GrowattInverterControl = GrowattInverterControl1;

export type GrowattInverterControl1 = {
    // Inverter Max output active power percent
    // 0-100 or 255
    // 255: power is not belimited
    ActivePRate: number;
};

export const GrowattInverterControl1Model = modbusModelFactory<
    GrowattInverterControl1,
    keyof GrowattInverterControl1
>({
    name: 'GrowattInverterControl1Model',
    mapping: {
        ActivePRate: {
            start: 0,
            end: 1,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
    },
});
