import { type ConnectStatusValue } from '../sep2/models/connectStatus.js';

export type StorageData = {
    date: Date;
    /**
     * State of charge represented between 0-1
     */
    socRatio: number;
    status: {
        storConnectStatus: ConnectStatusValue;
    };
};
