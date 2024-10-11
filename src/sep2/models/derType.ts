import { z } from 'zod';

// 0 - Not applicable / Unknown
// 1 - Virtual or mixed DER
// 2 - Reciprocating engine
// 3 - Fuel cell
// 4 - Photovoltaic system
// 5 - Combined heat and power
// 6 - Other generation system
// 80 - Other storage system
// 81 - Electric vehicle
// 82 - EVSE
// 83 - Combined PV and storage
// All other values reserved.
export enum DERType {
    NotApplicable = 0,
    VirtualOrMixedDER = 1,
    ReciprocatingEngine = 2,
    FuelCell = 3,
    PhotovoltaicSystem = 4,
    CombinedHeatAndPower = 5,
    OtherGenerationSystem = 6,
    OtherStorageSystem = 80,
    ElectricVehicle = 81,
    EVSE = 82,
    CombinedPVAndStorage = 83,
}

export const derTypeSchema = z.nativeEnum(DERType);
