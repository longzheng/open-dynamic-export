import { type ConnectStatusValue } from '../sep2/models/connectStatus.js';
import { type StorageModeStatusValue } from '../sep2/models/storageModeStatus.js';

export type StorageData = {
    date: Date;
    /**
     * State of charge represented between 0-1
     */
    socRatio: number;
    inverter: {
        realPower: number;
        reactivePower: number;
        voltagePhaseA: number | null;
        voltagePhaseB: number | null;
        voltagePhaseC: number | null;
        frequency: number;
    } | null;
    nameplate: {
        maxWh: number;
        maxW: number | null;
        maxVA: number | null;
        maxVar: number | null;
    };
    settings: {
        maxW: number | null;
        maxVA: number | null;
        maxVar: number | null;
    };
    status: {
        connectStatus: ConnectStatusValue;
        modeStatus: StorageModeStatusValue;
    };
};
