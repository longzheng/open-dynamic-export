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
    // Maximum allowed export to grid in watts
    exportLimitWatts: number;
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
        batteryPriorityMode,
        batteryGridChargingEnabled,
        batteryGridChargingMaxWatts,
        batteryExportTargetWatts,
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

    // How much battery discharge is needed to cover grid imports AND meet export target.
    // When exportTarget = 0 and availablePower = -500, this is 500 (self-consumption).
    // When exportTarget = 2000 and availablePower = -500, this is 2500 (cover deficit + export).
    // When exportTarget = 2000 and availablePower = 1000, this is 1000 (solar covers part of target).
    // When exportTarget = 0 and availablePower = 1000, this is 0 (surplus, no discharge needed).
    const batteryDischargeNeeded = Math.max(0, exportTarget - availablePower);

    if (batteryDischargeNeeded > 0 && canDischarge && !gridChargingActive) {
        // Discharge battery: cover grid imports and/or meet battery export target
        targetBatteryPowerWatts = -Math.min(
            batteryDischargeNeeded,
            maxDischargePower,
        );
        batteryMode = 'discharge';
        targetExportWatts = Math.min(exportTarget, exportLimitWatts);
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
            // Grid charging: charge battery from grid, capped at gridChargingMaxWatts
            const gridChargeLimit =
                batteryGridChargingMaxWatts ?? maxChargePower;
            const gridChargePower = Math.min(
                gridChargeLimit,
                maxChargePower,
                batteryNeedWatts,
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

    // Calculate target solar watts (for curtailment)
    // Uses exportLimitWatts (the configured limit) rather than targetExportWatts
    // (capped at current available power). Using targetExportWatts would create a
    // self-referential feedback loop: targetSolar = solarWatts, which locks the
    // inverter at its current output via the power ratio. Using the limit allows
    // the inverter to ramp up when not export-constrained (ratio → 1.0).
    //
    // Uses currentBatteryPowerWatts (measured) rather than targetBatteryPowerWatts
    // (commanded) to avoid a second feedback loop: when battery transitions from
    // charging to discharging, the target jumps negative immediately, which would
    // curtail solar before the battery has physically ramped. The curtailed solar
    // then confirms the discharge need, spiraling PV down to near-zero.
    // Using the measured value lets solar adjust gradually as the battery actually ramps.
    const targetSolarWatts = calculateTargetSolarWatts({
        solarWatts,
        siteWatts,
        targetExportWatts: exportLimitWatts,
        targetBatteryPowerWatts: currentBatteryPowerWatts,
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
 * Calculate target solar watts to meet export limit while accounting for battery charging.
 *
 * The relationship is:
 * - siteWatts = load - solar - batteryCharge (where batteryCharge > 0 means charging)
 * - export = -siteWatts (when siteWatts < 0)
 *
 * We want: export = targetExport
 * So: -siteWatts = targetExport
 * Therefore: siteWatts = -targetExport
 *
 * And: load - solar - batteryCharge = -targetExport
 * Solving for solar: solar = load + batteryCharge + targetExport
 */
function calculateTargetSolarWatts({
    solarWatts,
    siteWatts,
    targetExportWatts,
    targetBatteryPowerWatts,
}: {
    solarWatts: number;
    siteWatts: number;
    targetExportWatts: number;
    targetBatteryPowerWatts: number;
}): number {
    // Current load = solar + siteWatts
    // (when siteWatts > 0, we're importing to supplement solar)
    // (when siteWatts < 0, we're exporting excess solar)
    const loadWatts = solarWatts + siteWatts;

    // Target solar to achieve desired export and battery charge
    // solar = load + batteryCharge + export
    const targetSolar = loadWatts + targetBatteryPowerWatts + targetExportWatts;

    return targetSolar;
}
