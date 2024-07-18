import { mapEnumValueToEnumFlagsObject } from '../enum';

// 0 - End device shall indicate that message was received
// 1 - End device shall indicate specific response.
// 2 - End user / customer response is required.
export enum ResponseRequiredType {
    MessageReceived = 1 << 0,
    SpecificResponse = 1 << 1,
    EndUserResponse = 1 << 2,
}

export type ResponseRequiredTypeObject = Record<
    keyof typeof ResponseRequiredType,
    boolean
>;

export function mapHexStringToResponseRequiredTypeObject(
    value: number,
): ResponseRequiredTypeObject {
    return mapEnumValueToEnumFlagsObject(value, ResponseRequiredType);
}
