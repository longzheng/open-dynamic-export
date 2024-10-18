import { modbusModelFactory } from '../modbusModelFactory.js';
import { registersToUint32 } from '../../sunspec/helpers/converters.js';

export type SmaCore1Operation = {
    // Grid relay/contactor
    // 51: Closed (Cls)
    // 311: Open (Opn)
    // 16777213: Information not available (NaNStt)
    GriSwStt: SmaCore1OperationGriSwStt;
};

export enum SmaCore1OperationGriSwStt {
    Closed = 51,
    Open = 311,
    InformationNotAvailable = 16777213,
}

export const SmaCore1OperationModel = modbusModelFactory<SmaCore1Operation>({
    name: 'SmaCore1OperationModel',
    mapping: {
        GriSwStt: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
    },
});
