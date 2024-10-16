import { modbusModelFactory } from '../modbusModelFactory.js';
import { registersToUint32 } from '../../sunspec/helpers/converters.js';

export type SmaCore1Nameplate = {
    // Device type
    Model: number;
};

export const smaCore1NameplateModel = modbusModelFactory<SmaCore1Nameplate>({
    name: 'smaCore1Nameplate',
    mapping: {
        Model: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
    },
});
