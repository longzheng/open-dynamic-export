import { type ConnectStatus } from '../sep2/models/connectStatus.js';
import { type OperationalModeStatus } from '../sep2/models/operationModeStatus.js';
import { type DERTyp } from '../sunspec/models/nameplate.js';

export type InverterData = {
    date: Date;
    inverter: {
        realPower: number;
        reactivePower: number;
        voltagePhaseA: number;
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
        operationalModeStatus: OperationalModeStatus;
        genConnectStatus: ConnectStatus;
    };
};
