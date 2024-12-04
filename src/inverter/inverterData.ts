import { type DERTyp } from '../connections/sunspec/models/nameplate.js';
import { type ConnectStatusValue } from '../sep2/models/connectStatus.js';
import { type OperationalModeStatusValue } from '../sep2/models/operationModeStatus.js';

export type InverterData = {
    date: Date;
    inverter: {
        realPower: number;
        reactivePower: number;
        voltagePhaseA: number | null;
        voltagePhaseB: number | null;
        voltagePhaseC: number | null;
        frequency: number;
    };
    nameplate: {
        type: DERTyp;
        maxW: number;
        maxVA: number;
        maxVar: number;
    };
    settings: {
        maxW: number;
        maxVA: number | null;
        maxVar: number | null;
    };
    status: {
        operationalModeStatus: OperationalModeStatusValue;
        genConnectStatus: ConnectStatusValue;
    };
};
