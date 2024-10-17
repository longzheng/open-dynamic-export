import { modbusModelFactory } from '../modbusModelFactory.js';
import { registersToUint32 } from '../../sunspec/helpers/converters.js';

export type SmaCore1Nameplate = {
    // Device type
    // 9338: STP50-40 (STP50-40)
    // 9339: STP50-US-40 (STP50-US-40)
    // 9340: STP50-JP-40 (STP50-JP-40)
    Model: number;
};

export const SmaCore1NameplateModel = modbusModelFactory<SmaCore1Nameplate>({
    name: 'SmaCore1NameplateModel',
    mapping: {
        Model: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
    },
});
