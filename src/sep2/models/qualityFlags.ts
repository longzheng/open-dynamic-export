import { z } from 'zod';

// List of codes indicating the quality of the reading, using specification:
// Bit 0 - valid: data that has gone through all required validation checks and either passed them all or has been verified
// Bit 1 - manually edited: Replaced or approved by a human
// Bit 2 - estimated using reference day: data value was replaced by a machine computed value based on analysis of historical data using the same type of measurement.
// Bit 3 - estimated using linear interpolation: data value was computed using linear interpolation based on the readings before and after it
// Bit 4 - questionable: data that has failed one or more checks
// Bit 5 - derived: data that has been calculated (using logic or mathematical operations), not necessarily measured directly
// Bit 6 - projected (forecast): data that has been calculated as a projection or forecast of future readings
export enum QualityFlags {
    Valid = 1 << 0,
    ManuallyEdited = 1 << 1,
    EstimatedUsingReferenceDay = 1 << 2,
    EstimatedUsingLinearInterpolation = 1 << 3,
    Questionable = 1 << 4,
    Derived = 1 << 5,
    Projected = 1 << 6,
}

export const qualityFlagsSchema = z.nativeEnum(QualityFlags);
