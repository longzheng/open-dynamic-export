import { pinoLogger } from '../../helpers/logger.js';
import { type Logger } from 'pino';

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
    // Current battery state of charge percentage (0-100)
    batterySocPercent: number | null;
    // Target SOC percentage for battery charging
    batteryTargetSocPercent: number | undefined;
    // Minimum SOC percentage - don't discharge below this
    batterySocMinPercent: number | undefined;
    // Maximum SOC percentage - don't charge above this
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
        batterySocPercent,
        batteryTargetSocPercent,
        batterySocMinPercent,
        batterySocMaxPercent,
        batteryChargeMaxWatts,
        batteryDischargeMaxWatts,
        exportLimitWatts,
        batteryPriorityMode,
    } = input;

    logger.trace({ input }, 'Calculating battery power flow');

    // Calculate available power for battery/export
    // If siteWatts is negative (exporting), we have excess power
    // If siteWatts is positive (importing), we're consuming more than generating
    const availablePower = -siteWatts; // Can be negative (importing) or positive (exporting)

    // Determine battery SOC constraints
    const minSoc = batterySocMinPercent ?? 0;
    const maxSoc = batterySocMaxPercent ?? 100;
    const targetSoc = batteryTargetSocPercent ?? maxSoc;

    // Check if battery can charge or discharge based on SOC
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

    if (availablePower > 0) {
        // We have excess power to allocate
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
    }

    // Handle battery discharge when importing power
    if (availablePower < 0 && canDischarge) {
        // We're importing (consuming more than generating)
        // Consider discharging battery to reduce import
        // Only if we haven't reached min SOC
        const importPower = Math.abs(availablePower);

        // Discharge up to the import need, respecting battery limits
        targetBatteryPowerWatts = -Math.min(importPower, maxDischargePower);
        batteryMode = 'discharge';
        targetExportWatts = 0; // Not exporting when importing
    }

    // Calculate target solar watts (for curtailment)
    // We need to adjust solar to meet the export limit
    // targetSolar = current solar - amount to curtail
    // The curtailment is calculated to ensure: export = solar - load - batteryCharge
    const targetSolarWatts = calculateTargetSolarWatts({
        solarWatts,
        siteWatts,
        targetExportWatts,
        targetBatteryPowerWatts,
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
 * Calculate how much power the battery needs to reach target SOC.
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
        // Unknown SOC - assume battery can accept full charge power
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
