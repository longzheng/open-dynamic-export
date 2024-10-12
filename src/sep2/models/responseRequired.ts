import { zodBitwiseEnumSchema } from '../../helpers/zod.js';

// 0 - End device shall indicate that message was received
// 1 - End device shall indicate specific response.
// 2 - End user / customer response is required.
export enum ResponseRequiredType {
    MessageReceived = 1 << 0,
    SpecificResponse = 1 << 1,
    EndUserResponse = 1 << 2,
}

export const responseRequiredTypeSchema =
    zodBitwiseEnumSchema(ResponseRequiredType);
