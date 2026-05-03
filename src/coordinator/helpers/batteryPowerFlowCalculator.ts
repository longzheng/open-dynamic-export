import type { Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';

export type BatteryPowerFlowCalculation = {
    // Target battery power: positive = charge, negative = discharge, 0 = idle
    targetBatteryPowerWatts: number;
    // Target export power to grid
    targetExportWatts: number;
    // Target solar generation (for curtailment calculation)
    targetSolarWatts: number;
    // Battery operating mode
    batteryMode: 'charge' | 'discharge' | 'idle';
};

export type BatteryPowerFlowInput = {
    // Current solar generation in watts
    solarWatts: number;
    // Current site power at grid connection
    // positive = importing from grid (load > generation)
    // negative = exporting to grid (generation > load)
    siteWatts: number;
    // Current battery power from previous control cycle (positive = charging, negative = discharging)
    // On hybrid inverters, battery charge power is consumed inside the inverter before the AC output,
    // so siteWatts doesn't reflect the full available solar power. This value compensates for that.
    currentBatteryPowerWatts: number;
    // Current battery state of charge percentage (0-100)
    batterySocPercent: number | null;
    // Target SoC percentage for battery charging
    batteryTargetSocPercent: number | undefined;
    // Minimum SoC percentage - don't discharge below this
    batterySocMinPercent: number | undefined;
    // Maximum SoC percentage - don't charge above this
    batterySocMaxPercent: number | undefined;
    // Maximum battery charging power in watts
    batteryChargeMaxWatts: number | undefined;
    // Maximum battery discharging power in watts
    batteryDischargeMaxWatts: number | undefined;
    // Current solar output of battery-hosting inverters (watts).
    // On some hybrid inverters, any battery discharge curtails PV entirely on that
    // inverter. Discharge is only worthwhile when it exceeds this value (net gain).
    batteryInverterSolarW: number | undefined;
    // Maximum allowed export to grid in watts (opModExpLimW)
    exportLimitWatts: number;
    // Maximum allowed import from grid in watts (opModImpLimW)
    importLimitWatts: number;
    // Battery priority mode
    batteryPriorityMode: 'export_first' | 'battery_first' | undefined;
    // Whether grid charging is enabled
    batteryGridChargingEnabled: boolean | undefined;
    // Maximum power to draw from grid for battery charging in watts
    batteryGridChargingMaxWatts: number | undefined;
    // Target export power from battery discharge in watts.
    // When set, the battery discharges enough to cover house load AND export this
    // amount to the grid. When undefined/0, only self-consumption (zero grid import).
    batteryExportTargetWatts?: number | undefined;
};

const logger: Logger = pinoLogger.child({
    module: 'batteryPowerFlowCalculator',
});

/**
 * Calculate battery power flow based on available power and priority mode.
 *
 * Power flow priority:
 * - battery_first: consumption → battery → export
 * - export_first: consumption → export → battery
 *
 * Local consumption is automatically satisfied by the grid connection,
 * so we only need to manage the excess power.
 */
export function calculateBatteryPowerFlow(
    input: BatteryPowerFlowInput,
): BatteryPowerFlowCalculation {
    const {
        solarWatts,
        siteWatts,
        currentBatteryPowerWatts,
        batterySocPercent,
        batteryTargetSocPercent,
        batterySocMinPercent,
        batterySocMaxPercent,
        batteryChargeMaxWatts,
        batteryDischargeMaxWatts,
        exportLimitWatts,
        importLimitWatts,
        batteryPriorityMode,
        batteryGridChargingEnabled,
        batteryGridChargingMaxWatts,
        batteryExportTargetWatts,
        batteryInverterSolarW,
    } = input;

    logger.trace({ input }, 'Calculating battery power flow');

    // Calculate available power for battery/export.
    //
    // On hybrid inverters (PV + battery in one unit), solarWatts comes from the
    // SunSpec Model 103 W register which reports net AC output: PV minus battery
    // charging. So battery charge power is invisible to siteWatts — it's consumed
    // inside the inverter before reaching the AC bus.
    //
    // To get the TRUE available power (total PV minus load), we add back the
    // current battery power: availablePower = -siteWatts + currentBatteryPowerWatts
    //
    // This breaks the feedback loop where limiting battery charge → lower AC output
    // → lower apparent available power → even lower battery charge target.
    const availablePower = -siteWatts + currentBatteryPowerWatts;

    // Determine battery SoC constraints
    const minSoc = batterySocMinPercent ?? 0;
    const maxSoc = batterySocMaxPercent ?? 100;
    const targetSoc = batteryTargetSocPercent ?? maxSoc;

    // Check if battery can charge or discharge based on SoC
    const canCharge = batterySocPercent === null || batterySocPercent < maxSoc;
    const canDischarge =
        batterySocPercent === null || batterySocPercent > minSoc;

    // Determine actual battery limits
    const maxChargePower = batteryChargeMaxWatts ?? Number.MAX_SAFE_INTEGER;
    const maxDischargePower =
        batteryDischargeMaxWatts ?? Number.MAX_SAFE_INTEGER;

    // Default to battery_first if not specified
    const priorityMode = batteryPriorityMode ?? 'battery_first';

    let targetBatteryPowerWatts = 0;
    let targetExportWatts = 0;
    let batteryMode: 'charge' | 'discharge' | 'idle' = 'idle';

    // Battery export target: how much battery discharge power to export to grid.
    // When 0/undefined, only self-consumption (discharge to zero grid import).
    const exportTarget = batteryExportTargetWatts ?? 0;
    const gridChargingActive = batteryGridChargingEnabled === true;

    // Battery export target uses gap-filling semantics: PV surplus counts toward
    // the target, battery only discharges the difference. This ensures:
    // 1. Battery preserves capacity when PV already covers the export target
    // 2. Total site export (PV + battery) never exceeds exportLimitWatts (DOE compliance)
    //
    // When exportTarget = 0 and availablePower = -500: need 0, self-consumption 500 → discharge 500.
    // When exportTarget = 0 and availablePower = 1000: need 0, self-consumption 0 → no discharge.
    // When exportTarget = 2000 and availablePower = -500: need 2000, self-consumption 500 → discharge 2500.
    // When exportTarget = 2000 and availablePower = 5000: need 0 (PV covers it) → no discharge.
    // When exportTarget = 5000 and availablePower = 2000: need 3000 (battery fills gap) → discharge 3000.
    const pvSurplus = Math.max(0, availablePower);
    const batteryExportNeeded = Math.max(0, exportTarget - pvSurplus);

    // Hard-cap at DOE export headroom: how much more can be exported beyond PV
    const exportHeadroom = Math.max(0, exportLimitWatts - pvSurplus);

    // On some hybrid inverters, any battery discharge curtails PV entirely on
    // that inverter. Only discharge for export when the export gain exceeds the
    // PV that would be lost — otherwise total export actually decreases.
    // Self-consumption discharge is unaffected (it doesn't compete with PV export).
    const hybridPvLoss = batteryInverterSolarW ?? 0;
    const dischargeNetPositive =
        hybridPvLoss === 0 || batteryExportNeeded > hybridPvLoss;
    const effectiveExportTarget = dischargeNetPositive
        ? Math.min(batteryExportNeeded, exportHeadroom)
        : 0;

    const selfConsumptionDischarge = Math.max(0, -availablePower);
    const batteryDischargeNeeded =
        effectiveExportTarget + selfConsumptionDischarge;

    if (batteryDischargeNeeded > 0 && canDischarge && !gridChargingActive) {
        // Discharge battery: cover grid imports and/or meet battery export target
        targetBatteryPowerWatts = -Math.min(
            batteryDischargeNeeded,
            maxDischargePower,
        );
        batteryMode = 'discharge';
        targetExportWatts = effectiveExportTarget;
    } else if (availablePower > 0) {
        // We have excess solar power to allocate
        if (priorityMode === 'battery_first') {
            // Priority: consumption → battery → export
            const batteryNeedWatts = calculateBatteryNeedWatts({
                batterySocPercent,
                targetSocPercent: targetSoc,
                maxChargePower,
            });

            if (canCharge && batteryNeedWatts > 0) {
                // Try to charge battery first
                targetBatteryPowerWatts = Math.min(
                    availablePower,
                    maxChargePower,
                    batteryNeedWatts,
                );
                batteryMode = 'charge';

                // Export the remainder
                const remainingPower = availablePower - targetBatteryPowerWatts;
                targetExportWatts = Math.min(remainingPower, exportLimitWatts);
            } else {
                // Battery doesn't need charging or can't charge
                targetExportWatts = Math.min(availablePower, exportLimitWatts);
            }
        } else {
            // Priority: consumption → export → battery
            targetExportWatts = Math.min(availablePower, exportLimitWatts);

            // Charge battery with remaining power
            const remainingPower = availablePower - targetExportWatts;
            const batteryNeedWatts = calculateBatteryNeedWatts({
                batterySocPercent,
                targetSocPercent: targetSoc,
                maxChargePower,
            });

            if (canCharge && remainingPower > 0 && batteryNeedWatts > 0) {
                targetBatteryPowerWatts = Math.min(
                    remainingPower,
                    maxChargePower,
                    batteryNeedWatts,
                );
                batteryMode = 'charge';
            }
        }
    } else {
        // No surplus and no discharge needed: handle grid charging or idle
        const batteryNeedWatts = calculateBatteryNeedWatts({
            batterySocPercent,
            targetSocPercent: targetSoc,
            maxChargePower,
        });

        if (gridChargingActive && canCharge && batteryNeedWatts > 0) {
            // Grid charging: charge battery from grid, capped at gridChargingMaxWatts.
            // Also respect import limit (grid charge + house load must not exceed opModImpLimW).
            const gridChargeLimit =
                batteryGridChargingMaxWatts ?? maxChargePower;
            const currentImport = Math.max(0, siteWatts);
            const importHeadroom = Math.max(
                0,
                importLimitWatts - currentImport,
            );
            const gridChargePower = Math.min(
                gridChargeLimit,
                maxChargePower,
                batteryNeedWatts,
                importHeadroom,
            );

            targetBatteryPowerWatts = gridChargePower;
            batteryMode = 'charge';
            targetExportWatts = 0;
        } else if (gridChargingActive) {
            // Grid charging enabled but battery at/above target — hold idle
            // to avoid charge/discharge oscillation.
            // External tool disables grid charging when discharge should resume.
            targetBatteryPowerWatts = 0;
            batteryMode = 'idle';
            targetExportWatts = 0;
        }
    }

    // Deadband: snap to idle when target power is below a meaningful threshold.
    // Prevents rapid charge/discharge mode oscillation when grid power hovers near zero.
    const BATTERY_DEADBAND_WATTS = 50;
    if (Math.abs(targetBatteryPowerWatts) < BATTERY_DEADBAND_WATTS) {
        targetBatteryPowerWatts = 0;
        batteryMode = 'idle';
    }

    // Calculate target solar watts (for curtailment).
    //
    // PV is allowed to produce up to (load + commanded battery charge headroom +
    // export limit). Only the POSITIVE part of targetBatteryPowerWatts contributes
    // — i.e. charging adds headroom for PV; discharging does NOT subtract.
    //
    // Subtracting discharge (the previous formula, using currentBatteryPowerWatts
    // measured) caused a feedback spiral when export was blocked: discharge for
    // self-consumption → PV target dropped by the discharge amount → less PV →
    // larger load gap → more discharge → spiral, settling at ~4% power ratio.
    //
    // The new formula breaks the coupling: when the battery discharges to cover
    // load, PV is allowed to ramp up to load + exportLimit, which lets PV
    // *eliminate* the need for discharge (in sunny conditions) or be safely
    // light-limited below the target (in cloudy conditions). Either way, no
    // spiral, and the commanded ratio reflects the system's true PV demand.
    const loadWatts = solarWatts + siteWatts;
    const targetBatteryChargeWatts = Math.max(0, targetBatteryPowerWatts);
    const targetSolarWatts = calculateTargetSolarWatts({
        loadWatts,
        targetBatteryChargeWatts,
        exportLimitWatts,
    });

    const result: BatteryPowerFlowCalculation = {
        targetBatteryPowerWatts,
        targetExportWatts,
        targetSolarWatts,
        batteryMode,
    };

    logger.trace({ result }, 'Battery power flow calculation result');

    return result;
}

/**
 * Calculate how much power the battery needs to reach target SoC.
 * This is a simplified calculation - actual implementation would need
 * battery capacity and charging efficiency data.
 */
function calculateBatteryNeedWatts({
    batterySocPercent,
    targetSocPercent,
    maxChargePower,
}: {
    batterySocPercent: number | null;
    targetSocPercent: number;
    maxChargePower: number;
}): number {
    if (batterySocPercent === null) {
        // Unknown SoC - assume battery can accept full charge power
        return maxChargePower;
    }

    if (batterySocPercent >= targetSocPercent) {
        // Already at or above target
        return 0;
    }

    // Battery needs charging
    // For now, return max charge power
    // TODO: Could be more sophisticated with actual battery capacity
    // and calculate: (targetSoc - currentSoc) * batteryCapacityWh / 100
    return maxChargePower;
}

/**
 * Calculate the target solar AC output: the headroom PV is allowed to fill.
 *
 *   targetSolar = loadWatts + targetBatteryChargeWatts + exportLimitWatts
 *
 * `targetBatteryChargeWatts` is the commanded charge rate (≥ 0). When the
 * battery is idle or discharging, this term is 0 — PV can still produce up to
 * (load + export limit) but isn't given extra headroom for the battery, since
 * the battery isn't asking for any. Critically, discharge is NOT subtracted:
 * doing so would curtail PV by the discharge amount and create a feedback
 * spiral when export is blocked (PV drops → load gap grows → battery
 * discharges more → PV target drops further).
 *
 * The inverter naturally produces min(this_target, real_PV_available) — so when
 * light is plentiful, the limit binds and PV is curtailed to (load + charge +
 * export). When light is poor, the target is non-binding and PV produces what
 * the panels can deliver.
 */
function calculateTargetSolarWatts({
    loadWatts,
    targetBatteryChargeWatts,
    exportLimitWatts,
}: {
    loadWatts: number;
    targetBatteryChargeWatts: number;
    exportLimitWatts: number;
}): number {
    return loadWatts + targetBatteryChargeWatts + exportLimitWatts;
}
