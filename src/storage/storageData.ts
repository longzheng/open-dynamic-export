import { type ConnectStatusValue } from '../sep2/models/connectStatus.js';
import { type StorageModeStatusValue } from '../sep2/models/storageModeStatus.js';

export type StorageData = {
    date: Date;
    /**
     * State of charge represented between 0-1
     */
    socRatio: number;
    status: {
        connectStatus: ConnectStatusValue;
        modeStatus: StorageModeStatusValue;
    };
};
