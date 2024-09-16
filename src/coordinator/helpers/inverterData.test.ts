import { describe, expect, it } from 'vitest';
import { getConnectStatusFromPVConn } from './inverterData.js';
import { PVConn } from '../../sunspec/models/status.js';
import { ConnectStatus } from '../../sep2/models/connectStatus.js';

describe('getConnectStatusFromPVConn', () => {
    it('should return value if inverter is disconnected', () => {
        const result = getConnectStatusFromPVConn(0 as PVConn);

        expect(result).toEqual(0 as ConnectStatus);
    });

    it('should return value if inverter is connected, available, operating', () => {
        const result = getConnectStatusFromPVConn(
            PVConn.AVAILABLE | PVConn.CONNECTED | PVConn.OPERATING,
        );

        expect(result).toEqual(
            ConnectStatus.Available |
                ConnectStatus.Connected |
                ConnectStatus.Operating,
        );
    });
});
