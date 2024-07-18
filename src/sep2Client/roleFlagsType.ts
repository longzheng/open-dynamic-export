import { mapEnumValueToEnumFlagsObject } from '../enum';

// Bit 0 - isMirror - SHALL be set if the server is not the measurement device
// Bit 1 - isPremisesAggregationPoint - SHALL be set if the UsagePoint is the point of delivery for a premises
// Bit 2 - isPEV - SHALL be set if the usage applies to an electric vehicle
// Bit 3 - isDER - SHALL be set if the usage applies to a distributed energy resource, capable of delivering power to the grid.
// Bit 4 - isRevenueQuality - SHALL be set if usage was measured by a device certified as revenue quality
// Bit 5 - isDC - SHALL be set if the usage point measures direct current
// Bit 6 - isSubmeter - SHALL be set if the usage point is not a premises aggregation point
// Bit 7-15 - Reserved
export enum RoleFlagsType {
    isMirror = 1 << 0,
    isPremisesAggregationPoint = 1 << 1,
    isPEV = 1 << 2,
    isDER = 1 << 3,
    isRevenueQuality = 1 << 4,
    isDC = 1 << 5,
    isSubmeter = 1 << 6,
    // Reserved bits 7 to 15
}

export type RoleFlagsTypeObject = Record<keyof typeof RoleFlagsType, boolean>;

export function mapEnumNumberToRoleFlagsObject(
    value: number,
): RoleFlagsTypeObject {
    return mapEnumValueToEnumFlagsObject(value, RoleFlagsType);
}
