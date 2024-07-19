import { mapEnumValueToEnumFlagsObject } from '../enum';

// DER ConnectStatus value (bitmap):
// 0 - Connected
// 1 - Available
// 2 - Operating
// 3 - Test
// 4 - Fault / Error
// All other values reserved.
export enum ConnectStatus {
    Connected = 1 << 0,
    Available = 1 << 1,
    Operating = 1 << 2,
    Test = 1 << 3,
    Fault = 1 << 4,
}

export type ConnectStatusObject = Record<keyof typeof ConnectStatus, boolean>;

export function mapEnumNumberToConnectStatusObject(
    value: number,
): ConnectStatusObject {
    return mapEnumValueToEnumFlagsObject(value, ConnectStatus);
}
