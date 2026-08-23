import * as v from 'valibot';
import { derTypSchema } from '../connections/sunspec/models/nameplate.js';
import { connectStatusValueSchema } from '../sep2/models/connectStatus.js';
import { operationalModeStatusValueSchema } from '../sep2/models/operationModeStatus.js';
import type { SampleBase } from '../coordinator/helpers/sampleBase.js';
import { ChaSt, ChaGriSet } from '../connections/sunspec/models/storage.js';

export const inverterDataSchema = v.object({
    inverter: v.object({
        /**
         * Positive values = inverter export (produce) power
         *
         * Negative values = inverter import (consume) power
         *
         * Value is total (net across all phases) measurement
         */
        realPower: v.number(),
        reactivePower: v.number(),
        voltagePhaseA: v.nullable(v.number()),
        voltagePhaseB: v.nullable(v.number()),
        voltagePhaseC: v.nullable(v.number()),
        frequency: v.number(),
    }),
    nameplate: v.object({
        type: derTypSchema,
        maxW: v.number(),
        maxVA: v.number(),
        maxVar: v.number(),
    }),
    settings: v.object({
        maxW: v.number(),
        maxVA: v.nullable(v.number()),
        maxVar: v.nullable(v.number()),
    }),
    status: v.object({
        operationalModeStatus: operationalModeStatusValueSchema,
        genConnectStatus: connectStatusValueSchema,
    }),
    storage: v.optional(
        v.object({
            // Battery capacity and state
            stateOfChargePercent: v.nullable(v.number()),
            availableEnergyWh: v.nullable(v.number()),
            batteryVoltage: v.nullable(v.number()),
            chargeStatus: v.nullable(v.enum(ChaSt)),
            // Charge/discharge rates and limits
            maxChargeRateWatts: v.number(),
            maxDischargeRateWatts: v.number(),
            currentChargeRatePercent: v.nullable(v.number()),
            currentDischargeRatePercent: v.nullable(v.number()),
            // Measured battery DC power from MPPT channel (positive = discharging, negative = charging)
            currentBatteryPowerWatts: v.nullable(v.number()),
            // Control settings
            minReservePercent: v.nullable(v.number()),
            gridChargingPermitted: v.nullable(v.enum(ChaGriSet)),
        }),
    ),
});

export type InverterDataBase = v.InferOutput<typeof inverterDataSchema>;

export type InverterData = SampleBase & InverterDataBase;
