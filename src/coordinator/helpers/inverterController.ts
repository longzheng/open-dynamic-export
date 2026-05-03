import { Decimal } from 'decimal.js';
import type { Logger } from 'pino';
import { differenceInSeconds } from 'date-fns';
import type { ControlType } from '../../sep2/helpers/controlScheduler.js';
import { numberWithPow10, roundToDecimals } from '../../helpers/number.js';
import { pinoLogger } from '../../helpers/logger.js';
import {
    writeActiveControlLimit,
    writeInverterControllerPoints,
    writeLatency,
    writeLoadWatts,
} from '../../helpers/influxdb.js';
import type { SiteSample } from '../../meters/siteSample.js';
import type { Setpoints } from '../../setpoints/index.js';
import {
    objectEntriesWithType,
    objectFromEntriesWithType,
} from '../../helpers/object.js';
import type { Config, SetpointKeys } from '../../helpers/config.js';
import { cappedChange } from '../../helpers/math.js';
import { CappedArrayStack } from '../../helpers/cappedArrayStack.js';
import { timeWeightedAverage } from '../../helpers/timeWeightedAverage.js';
import type { ControlsModel } from '../../connections/sunspec/models/controls.js';
import type { DerSample } from './derSample.js';
import { Publish } from './publish.js';
import {
    calculateBatteryPowerFlow,
    type BatteryPowerFlowInput,
} from './batteryPowerFlowCalculator.js';

export type SupportedControlTypes = Extract<
    ControlType,
    | 'opModExpLimW'
    | 'opModGenLimW'
    | 'opModImpLimW'
    | 'opModLoadLimW'
    | 'opModEnergize'
    | 'opModConnect'
>;

export type InverterControlTypes =
    | 'fixed'
    | 'mqtt'
    | 'csipAus'
    | 'twoWayTariff'
    | 'negativeFeedIn'
    | 'batteryChargeBuffer';

export type InverterControlLimit = {
    source: InverterControlTypes;
    opModEnergize: boolean | undefined;
    opModConnect: boolean | undefined;
    opModGenLimW: number | undefined;
    opModExpLimW: number | undefined;
    opModImpLimW: number | undefined;
    opModLoadLimW: number | undefined;
    // Battery control attributes (all optional for backward compatibility)
    batteryChargeRatePercent?: number | undefined;
    batteryDischargeRatePercent?: number | undefined;
    batteryStorageMode?: number | undefined; // Maps to StorCtl_Mod
    batteryTargetSocPercent?: number | undefined;
    batteryImportTargetWatts?: number | undefined;
    batteryExportTargetWatts?: number | undefined;
    batterySocMinPercent?: number | undefined;
    batterySocMaxPercent?: number | undefined;
    batteryChargeMaxWatts?: number | undefined;
    batteryDischargeMaxWatts?: number | undefined;
    batteryPriorityMode?: 'export_first' | 'battery_first' | undefined;
    batteryGridChargingEnabled?: boolean | undefined;
    batteryGridChargingMaxWatts?: number | undefined;
};

export type BatteryControlConfiguration = {
    // Target battery power: positive = charge, negative = discharge
    targetPowerWatts: number;
    // Battery operating mode
    mode: 'charge' | 'discharge' | 'idle';
    // Charge rate cap as percentage (0-100) of WChaMax — optional user-configured limit
    chargeRatePercent?: number | undefined;
    // Discharge rate cap as percentage (0-100) of WChaMax — optional user-configured limit
    dischargeRatePercent?: number | undefined;
};

export type InverterConfiguration =
    | { type: 'disconnect' }
    | { type: 'deenergize' }
    | {
          type: 'limit';
          invertersCount: number;
          targetSolarWatts: number;
          targetSolarPowerRatio: number;
          batteryControl?: BatteryControlConfiguration | undefined;
      };

const defaultValues = {
    opModGenLimW: Number.MAX_SAFE_INTEGER,
    opModLoadLimW: Number.MAX_SAFE_INTEGER,
    opModExpLimW: Number.MAX_SAFE_INTEGER,
    opModImpLimW: Number.MAX_SAFE_INTEGER,
    opModEnergize: true,
    opModConnect: true,
} as const satisfies Record<ControlType, unknown>;

// Exponential moving average smoothing factor for the battery-flow
// calculator's siteWatts and currentBatteryPowerWatts inputs.
// At 1Hz cycles, alpha=0.4 gives a ~2.5-second time constant
// (~95% step response in 8s), which damps the per-cycle oscillation
// caused by battery-ramp / meter-reading coupling without significantly
// slowing the response to genuine load changes. Tune lower (0.2-0.3)
// for more damping, higher (0.5-0.7) for faster response.
const BATTERY_FLOW_INPUT_EMA_ALPHA = 0.4;

function applyEma(
    previous: number | null,
    current: number,
    alpha: number,
): number {
    if (previous === null) {
        return current;
    }
    return alpha * current + (1 - alpha) * previous;
}

export class InverterController {
    private publish: Publish;
    private cachedDerSample = new CappedArrayStack<DerSample>({ limit: 100 });
    private cachedSiteSample = new CappedArrayStack<SiteSample>({ limit: 100 });
    private logger: Logger;
    private setpoints: Setpoints;
    private loadWattsCache: number | null = null;
    private controlLimitsCache: {
        controlLimitsBySetpoint: ControlLimitsBySetpoint;
        activeInverterControlLimit: ActiveInverterControlLimit;
    } | null = null;
    private lastAppliedInverterConfiguration: InverterConfiguration | null =
        null;
    private onControl: (
        inverterConfiguration: InverterConfiguration,
    ) => Promise<void>;

    // instantaneous DER and site readings are unrealiable since they are sampled at different intervals
    // due to the nature of control influencing the measurements which create a feedback loop
    // we don't want to rely on the latest readings to make decisions since it will lead to oscillating control values
    // we take a time weighted average of the last few seconds to smooth out the control values
    private secondsToSample: number;
    private intervalSeconds: number;
    private controlLimitsLoopTimer: NodeJS.Timeout | null = null;
    private applyControlLoopTimer: NodeJS.Timeout | null = null;
    private abortController: AbortController;
    private batteryChargeBufferWatts: number | null = null;
    private batteryPowerFlowControlEnabled: boolean;
    // Ramped battery export target — smooths transitions when MQTT changes
    // the export target (e.g. 0 → 3000W), preventing abrupt battery swings
    // that cause hybrid inverters (e.g. Fronius) to curtail PV to protect the DC bus.
    // Load-driven discharge is unaffected since it uses self-consumption path.
    private rampedBatteryExportTargetWatts: number = 0;
    // Idle dwell counter for charge→discharge transitions on hybrid inverters.
    // Some hybrid inverters (e.g. Fronius Gen24) disrupt the DC bus when the
    // battery transitions from charge to discharge — MPPT loses tracking and
    // PV crashes to near-zero. Holding at idle for several cycles lets the DC
    // bus stabilise before discharge begins.
    private batteryIdleDwellRemaining: number = 0;
    // Exponentially-smoothed siteWatts and currentBatteryPowerWatts for the
    // battery-flow calculator. The calculator's `availablePower` formula
    // (`-siteWatts + currentBatteryPowerWatts`) is naive proportional control
    // — feeding it instantaneous values causes a 1Hz oscillation in commanded
    // battery targets when the battery's own ramp dynamics couple back into
    // the meter reading mid-cycle (observed up to ~3500W swings between
    // adjacent cycles in trace logs). The hardware-side ramp limit
    // (WDisChaGra) masks most of the impact in actual battery output, but
    // the wasted control effort is real and worth damping. Reset to null
    // when sample stream drops so we don't carry stale state through gaps.
    private smoothedSiteWatts: number | null = null;
    private smoothedCurrentBatteryPowerWatts: number | null = null;

    constructor({
        config,
        setpoints,
        onControl,
    }: {
        config: Config;
        setpoints: Setpoints;
        onControl: (
            inverterConfiguration: InverterConfiguration,
        ) => Promise<void>;
    }) {
        this.publish = new Publish({ config });
        this.secondsToSample = config.inverterControl.sampleSeconds;
        this.intervalSeconds = config.inverterControl.intervalSeconds;
        this.batteryChargeBufferWatts =
            config.battery?.chargeBufferWatts ?? null;
        this.batteryPowerFlowControlEnabled =
            config.inverterControl.batteryPowerFlowControl;
        this.setpoints = setpoints;
        this.logger = pinoLogger.child({ module: 'InverterController' });
        this.abortController = new AbortController();
        this.onControl = onControl;

        this.updateControlLimitsLoop();
        void this.applyControlLoop();
    }

    updateDerSample(derSample: DerSample) {
        this.cachedDerSample.push(derSample);

        this.updateLoadWatts();
    }

    updateSiteSample(siteSample: SiteSample) {
        this.cachedSiteSample.push(siteSample);

        this.updateLoadWatts();
    }

    public get getLoadWatts() {
        return this.loadWattsCache;
    }

    public get getControlLimits() {
        return this.controlLimitsCache;
    }

    public get getLastAppliedInverterConfiguration() {
        return this.lastAppliedInverterConfiguration;
    }

    private updateLoadWatts() {
        const lastSolarWatts = this.cachedDerSample.get().at(-1)?.realPower.net;
        const lastSiteWatts = this.cachedSiteSample.get().at(-1)?.realPower.net;

        if (lastSolarWatts === undefined || lastSiteWatts === undefined) {
            this.loadWattsCache = null;
            return;
        }

        const loadWatts = lastSolarWatts + lastSiteWatts;

        this.loadWattsCache = loadWatts;

        writeLoadWatts(loadWatts);
    }

    private updateControlLimitsLoop() {
        const start = performance.now();

        const controlLimitsBySetpoint = objectFromEntriesWithType(
            objectEntriesWithType(this.setpoints).map(([key, setpoint]) => [
                key,
                setpoint?.getInverterControlLimit() ?? null,
            ]),
        );

        const activeInverterControlLimit = getActiveInverterControlLimit(
            Object.values(controlLimitsBySetpoint),
        );

        writeActiveControlLimit({ limit: activeInverterControlLimit });

        this.publish.onActiveInverterControlLimit({
            limit: activeInverterControlLimit,
        });

        this.controlLimitsCache = {
            controlLimitsBySetpoint,
            activeInverterControlLimit,
        };

        const end = performance.now();
        const duration = end - start;

        this.logger.trace(
            { duration, ...this.controlLimitsCache },
            'control limits loop updated',
        );

        writeLatency({ field: 'controlLimitsLoop', duration });

        // update at most every 1 second
        const delay = Math.max(1000 - duration, 0);

        this.controlLimitsLoopTimer = setTimeout(() => {
            void this.updateControlLimitsLoop();
        }, delay);
    }

    private async applyControlLoop() {
        const start = performance.now();

        const inverterConfiguration = this.getInverterConfiguration();

        try {
            if (!inverterConfiguration) {
                this.logger.warn('Inverter configuration is not calculated');
            } else {
                await this.onControl(inverterConfiguration);

                this.logger.info(
                    {
                        activeInverterControlLimit:
                            this.controlLimitsCache?.activeInverterControlLimit,
                        inverterConfiguration,
                    },
                    'Set inverter control values',
                );

                this.lastAppliedInverterConfiguration = inverterConfiguration;
            }
        } catch (error) {
            this.logger.error(error, 'Failed to set inverter control values');
        } finally {
            if (!this.abortController.signal.aborted) {
                const end = performance.now();
                const duration = end - start;

                this.logger.trace(
                    { duration },
                    'Inverter control loop duration',
                );

                writeLatency({ field: 'applyControlLoop', duration });

                const delay = Math.max(
                    this.intervalSeconds * 1000 - duration,
                    0,
                );

                this.applyControlLoopTimer = setTimeout(() => {
                    void this.applyControlLoop();
                }, delay);
            }
        }
    }

    private getInverterConfiguration(): InverterConfiguration | null {
        if (!this.controlLimitsCache) {
            this.logger.warn('Control limits not available');
            return null;
        }

        const now = new Date();

        const recentDerSamples = this.cachedDerSample
            .get()
            .filter(
                (sample) =>
                    differenceInSeconds(now, sample.date) <=
                    this.secondsToSample,
            );

        const recentSiteSamples = this.cachedSiteSample
            .get()
            .filter(
                (sample) =>
                    differenceInSeconds(now, sample.date) <=
                    this.secondsToSample,
            );

        if (!recentDerSamples.length || !recentSiteSamples.length) {
            this.logger.warn('No recent DER or site samples');
            // Reset EMA state when sample stream drops so we don't carry
            // stale smoothed values across the gap.
            this.smoothedSiteWatts = null;
            this.smoothedCurrentBatteryPowerWatts = null;
            return null;
        }

        const averagedSolarWatts = timeWeightedAverage(
            recentDerSamples.map((s) => ({
                timestamp: s.date,
                value: s.realPower.net,
            })),
        );
        const averagedSiteWatts = timeWeightedAverage(
            recentSiteSamples.map((s) => ({
                timestamp: s.date,
                value: s.realPower.net,
            })),
        );
        const averagedNameplateMaxW = timeWeightedAverage(
            recentDerSamples.map((s) => ({
                timestamp: s.date,
                value: s.nameplate.maxW,
            })),
        );

        // Use the most recent site reading for battery control so the battery
        // responds immediately to load changes, rather than waiting for the
        // time-weighted average to catch up.  Solar curtailment (WMaxLimPct)
        // continues to use the averaged value to avoid rapid power swings.
        const mostRecentSiteWatts =
            recentSiteSamples[recentSiteSamples.length - 1]!.realPower.net;

        const maxInvertersCount = Math.max(
            ...recentDerSamples.map((sample) => sample.invertersCount),
        );

        // Extract battery SoC from most recent DER sample
        // Average SoC across all batteries (if multiple batteries present)
        const batterySocPercent: number | null = (() => {
            const mostRecentSample =
                recentDerSamples[recentDerSamples.length - 1];
            return mostRecentSample?.battery?.averageSocPercent ?? null;
        })();

        const batteryAdjustedInverterControlLimit = (() => {
            const batteryChargeBufferWatts = this.batteryChargeBufferWatts;

            if (batteryChargeBufferWatts === null) {
                return this.controlLimitsCache.activeInverterControlLimit;
            }

            const adjustedInverterControlLimit =
                adjustActiveInverterControlForBatteryCharging({
                    activeInverterControlLimit:
                        this.controlLimitsCache.activeInverterControlLimit,
                    batteryChargeBufferWatts,
                });

            this.logger.info(
                {
                    activeInverterControlLimit:
                        this.controlLimitsCache.activeInverterControlLimit,
                    batteryChargeBufferWatts,
                    adjustedInverterControlLimit,
                },
                'Adjusted active inverter control limit for battery charging',
            );

            return adjustedInverterControlLimit;
        })();

        const rampedInverterConfiguration = ((): InverterConfiguration => {
            // Get actual measured battery power from the most recent DER sample.
            // MPPT measurement convention: positive = discharging, negative = charging.
            // Battery flow calculator convention: positive = charging, negative = discharging.
            // We negate the measured value to match the calculator's convention.
            // Falls back to the previous commanded target if measurement is unavailable.
            const currentBatteryPowerWatts = (() => {
                const mostRecentSample =
                    recentDerSamples[recentDerSamples.length - 1];
                const measured =
                    mostRecentSample?.battery?.totalCurrentBatteryPowerWatts ??
                    null;

                if (measured !== null) {
                    return -measured;
                }

                // Fallback: use previous commanded target if no measurement available
                if (
                    this.lastAppliedInverterConfiguration?.type === 'limit' &&
                    this.lastAppliedInverterConfiguration.batteryControl
                ) {
                    return this.lastAppliedInverterConfiguration.batteryControl
                        .targetPowerWatts;
                }
                return 0;
            })();

            // Ramp the battery export target to prevent abrupt battery swings
            // when MQTT changes it (e.g. 0 → 3000W).  This smooths the
            // charge→discharge transition so the inverter's DC bus/MPPT can adjust
            // gradually.  Load-driven discharge (self-consumption) is unaffected
            // since it uses the separate selfConsumptionDischarge path.
            const rawExportTarget =
                batteryAdjustedInverterControlLimit.batteryExportTargetWatts
                    ?.value ?? 0;
            const maxExportTargetChange = 1000; // watts per cycle (~1kW/s)
            this.rampedBatteryExportTargetWatts = cappedChange({
                previousValue: this.rampedBatteryExportTargetWatts,
                targetValue: rawExportTarget,
                maxChange: maxExportTargetChange,
            });

            const rampedControlLimit = {
                ...batteryAdjustedInverterControlLimit,
                batteryExportTargetWatts:
                    this.rampedBatteryExportTargetWatts > 0
                        ? {
                              source:
                                  batteryAdjustedInverterControlLimit
                                      .batteryExportTargetWatts?.source ??
                                  'mqtt',
                              value: this.rampedBatteryExportTargetWatts,
                          }
                        : undefined,
            };

            // Get the hybrid inverter's current PV output from the most recent
            // DER sample. Used to check if battery discharge would be a net loss
            // (some hybrid inverters curtail PV entirely when discharging).
            const batteryInverterSolarW = (() => {
                const mostRecentSample =
                    recentDerSamples[recentDerSamples.length - 1];
                return mostRecentSample?.battery?.batteryInverterSolarW;
            })();

            // Damp the per-cycle noise on siteWatts and currentBatteryPowerWatts
            // before they enter the battery-flow calculator. The calculator's
            // `availablePower = -siteWatts + currentBatteryPowerWatts` formula
            // is naive proportional control: feeding it instantaneous values
            // produces 1Hz oscillation in commanded battery targets (observed
            // up to ~3500W swings between adjacent cycles in trace logs)
            // because the battery's physical ramp dynamics couple back into
            // the meter reading mid-cycle. The hardware-side ramp limit
            // (WDisChaGra) masks most of the impact in delivered power, but
            // the wasted control effort is real. EMA smoothing here is
            // applied to BOTH inputs symmetrically so the relationship
            // between them stays consistent.
            this.smoothedSiteWatts = applyEma(
                this.smoothedSiteWatts,
                mostRecentSiteWatts,
                BATTERY_FLOW_INPUT_EMA_ALPHA,
            );
            this.smoothedCurrentBatteryPowerWatts = applyEma(
                this.smoothedCurrentBatteryPowerWatts,
                currentBatteryPowerWatts,
                BATTERY_FLOW_INPUT_EMA_ALPHA,
            );

            const configuration = calculateInverterConfiguration({
                activeInverterControlLimit: rampedControlLimit,
                nameplateMaxW: averagedNameplateMaxW,
                siteWatts: averagedSiteWatts,
                instantaneousSiteWatts: this.smoothedSiteWatts,
                solarWatts: averagedSolarWatts,
                maxInvertersCount,
                batteryPowerFlowControlEnabled:
                    this.batteryPowerFlowControlEnabled,
                batterySocPercent,
                currentBatteryPowerWatts: this.smoothedCurrentBatteryPowerWatts,
                batteryInverterSolarW,
            });

            switch (configuration.type) {
                case 'disconnect':
                    return configuration;
                case 'deenergize':
                    return configuration;
                case 'limit': {
                    // ramp the target solar power ratio to prevent sudden changes (e.g. 0% > 100% > 0%)
                    // prevents inverter from potential hardware damage
                    // also prevents feedback cycle with batteries constantly switching between charge/discharge
                    const previousTarget = ((): {
                        targetSolarWatts: number;
                        targetSolarPowerRatio: number;
                    } | null => {
                        if (!this.lastAppliedInverterConfiguration) {
                            return null;
                        }

                        switch (this.lastAppliedInverterConfiguration.type) {
                            case 'disconnect':
                            case 'deenergize':
                                // slowly ramp from 0 if previously disconnected/deenergized
                                return {
                                    targetSolarWatts: 0,
                                    targetSolarPowerRatio: 0,
                                };
                            case 'limit':
                                return this.lastAppliedInverterConfiguration;
                        }
                    })();

                    if (previousTarget === null) {
                        return configuration;
                    }

                    // max 5% absolute change on the power ratio (0-1 range)
                    // only the ratio is ramped as it directly controls WMaxLimPct
                    // targetSolarWatts is not ramped - it reflects the true calculated target
                    //
                    // 5%/cycle (≈20s for full 100→0% ramp) is slower than the
                    // initial 10%/cycle to give hybrid inverter MPPT time to
                    // follow the falling limit. On Fronius Gen24, a faster ramp
                    // caused all strings to de-load (>450V) and stay there for
                    // 30+ minutes after WMaxLimPct returned to 100% — observed
                    // multiple times per day during Amber-driven curtailment.
                    // Stays well within the 30s event-start notice window
                    // (CSIP-AUS handbook §9), so DOE response remains compliant.
                    const maxChange = 0.05;

                    const rampedTargetSolarPowerRatio = cappedChange({
                        previousValue: previousTarget.targetSolarPowerRatio,
                        targetValue: configuration.targetSolarPowerRatio,
                        maxChange,
                    });

                    // Ramp battery discharge power to prevent DC bus slam.
                    // The export target ramp (1kW/cycle) is insufficient because
                    // gap-filling creates a positive feedback loop: discharge
                    // reduces pvSurplus → larger gap → more discharge → etc.
                    // This ramp caps the actual power change per cycle.
                    //
                    // Additionally, some hybrid inverters (e.g. Fronius Gen24)
                    // disrupt the DC bus when the battery transitions from
                    // charge to discharge (MPPT loses tracking, PV crashes to
                    // near-zero). An idle dwell period holds the battery at 0W
                    // for several cycles to let the DC bus stabilise before
                    // discharge begins.
                    const rampedBatteryControl = (() => {
                        if (!configuration.batteryControl) {
                            return configuration.batteryControl;
                        }

                        const previousBatteryPower =
                            this.lastAppliedInverterConfiguration?.type ===
                                'limit' &&
                            this.lastAppliedInverterConfiguration.batteryControl
                                ? this.lastAppliedInverterConfiguration
                                      .batteryControl.targetPowerWatts
                                : 0;

                        const targetPower =
                            configuration.batteryControl.targetPowerWatts;

                        // Detect charge→discharge transition and start idle dwell
                        const IDLE_DWELL_CYCLES = 5;
                        if (previousBatteryPower > 0 && targetPower < 0) {
                            this.batteryIdleDwellRemaining = IDLE_DWELL_CYCLES;
                        }

                        // During dwell, hold at idle (0W)
                        if (this.batteryIdleDwellRemaining > 0) {
                            this.batteryIdleDwellRemaining--;
                            return {
                                ...configuration.batteryControl,
                                targetPowerWatts: 0,
                                mode: 'idle' as const,
                            };
                        }

                        const maxBatteryPowerChange = 1000; // watts per cycle
                        const rampedPower = cappedChange({
                            previousValue: previousBatteryPower,
                            targetValue: targetPower,
                            maxChange: maxBatteryPowerChange,
                        });

                        return {
                            ...configuration.batteryControl,
                            targetPowerWatts: rampedPower,
                        };
                    })();

                    return {
                        type: 'limit',
                        invertersCount: configuration.invertersCount,
                        targetSolarWatts: configuration.targetSolarWatts,
                        targetSolarPowerRatio: rampedTargetSolarPowerRatio,
                        batteryControl: rampedBatteryControl,
                    };
                }
            }
        })();

        return rampedInverterConfiguration;
    }

    public destroy() {
        this.abortController.abort();

        if (this.controlLimitsLoopTimer) {
            clearTimeout(this.controlLimitsLoopTimer);
        }

        if (this.applyControlLoopTimer) {
            clearTimeout(this.applyControlLoopTimer);
        }
    }
}

export function calculateInverterConfiguration({
    activeInverterControlLimit,
    siteWatts,
    instantaneousSiteWatts,
    solarWatts,
    nameplateMaxW,
    maxInvertersCount,
    batteryPowerFlowControlEnabled,
    batterySocPercent,
    currentBatteryPowerWatts,
    batteryInverterSolarW,
}: {
    activeInverterControlLimit: ActiveInverterControlLimit;
    siteWatts: number;
    /** Most recent site reading for fast battery response. Falls back to averaged siteWatts. */
    instantaneousSiteWatts?: number;
    solarWatts: number;
    nameplateMaxW: number;
    maxInvertersCount: number;
    batteryPowerFlowControlEnabled: boolean;
    batterySocPercent: number | null;
    currentBatteryPowerWatts: number;
    /** Current PV output of battery-hosting inverters, for hybrid PV-loss check. */
    batteryInverterSolarW?: number | undefined;
}): InverterConfiguration {
    const logger = pinoLogger.child({
        module: 'calculateInverterConfiguration',
    });

    logger.trace(
        {
            activeInverterControlLimit,
        },
        'activeInverterControlLimit',
    );

    const energize =
        activeInverterControlLimit.opModEnergize?.value ??
        defaultValues.opModEnergize;

    const connect =
        activeInverterControlLimit.opModConnect?.value ??
        defaultValues.opModConnect;

    const disconnect = energize === false || connect === false;

    const exportLimitWatts =
        activeInverterControlLimit.opModExpLimW?.value ??
        defaultValues.opModExpLimW;

    const generationLimitWatts =
        activeInverterControlLimit.opModGenLimW?.value ??
        defaultValues.opModGenLimW;

    // Battery power flow control logic
    let batteryControl: BatteryControlConfiguration | undefined;
    let finalTargetSolarWatts: number;

    if (batteryPowerFlowControlEnabled && !disconnect) {
        // Use battery power flow calculator for intelligent battery control.
        // Use instantaneous site reading so the battery responds immediately
        // to load changes rather than waiting for the averaged value to catch up.
        const batteryFlowInput: BatteryPowerFlowInput = {
            solarWatts,
            siteWatts: instantaneousSiteWatts ?? siteWatts,
            currentBatteryPowerWatts,
            batterySocPercent,
            batteryTargetSocPercent:
                activeInverterControlLimit.batteryTargetSocPercent?.value,
            batterySocMinPercent:
                activeInverterControlLimit.batterySocMinPercent?.value,
            batterySocMaxPercent:
                activeInverterControlLimit.batterySocMaxPercent?.value,
            batteryChargeMaxWatts:
                activeInverterControlLimit.batteryChargeMaxWatts?.value,
            batteryDischargeMaxWatts:
                activeInverterControlLimit.batteryDischargeMaxWatts?.value,
            exportLimitWatts,
            importLimitWatts:
                activeInverterControlLimit.opModImpLimW?.value ??
                defaultValues.opModImpLimW,
            batteryPriorityMode:
                activeInverterControlLimit.batteryPriorityMode?.value,
            batteryGridChargingEnabled:
                activeInverterControlLimit.batteryGridChargingEnabled?.value,
            batteryGridChargingMaxWatts:
                activeInverterControlLimit.batteryGridChargingMaxWatts?.value,
            batteryExportTargetWatts:
                activeInverterControlLimit.batteryExportTargetWatts?.value,
            batteryInverterSolarW,
        };

        const batteryFlowResult = calculateBatteryPowerFlow(batteryFlowInput);

        // Create battery control configuration
        batteryControl = {
            targetPowerWatts: batteryFlowResult.targetBatteryPowerWatts,
            mode: batteryFlowResult.batteryMode,
            chargeRatePercent:
                activeInverterControlLimit.batteryChargeRatePercent?.value,
            dischargeRatePercent:
                activeInverterControlLimit.batteryDischargeRatePercent?.value,
        };

        finalTargetSolarWatts = Math.min(
            batteryFlowResult.targetSolarWatts,
            generationLimitWatts,
        );

        logger.trace(
            {
                batteryFlowInput,
                batteryFlowResult,
                batteryControl,
            },
            'Battery power flow calculation',
        );
    } else {
        // Legacy mode: use simple export limit calculation
        const exportLimitTargetSolarWatts = calculateTargetSolarWatts({
            exportLimitWatts,
            siteWatts,
            solarWatts,
        });

        finalTargetSolarWatts = Math.min(
            exportLimitTargetSolarWatts,
            generationLimitWatts,
        );
    }

    const exportLimitTargetSolarWatts = calculateTargetSolarWatts({
        exportLimitWatts,
        siteWatts,
        solarWatts,
    });

    // the limits need to be applied together
    // take the lesser of the export limit target solar watts or generation limit
    const targetSolarWatts = finalTargetSolarWatts;

    const targetSolarPowerRatio = calculateTargetSolarPowerRatio({
        nameplateMaxW,
        targetSolarWatts,
    });

    writeInverterControllerPoints({
        disconnect,
        siteWatts,
        solarWatts,
        exportLimitWatts,
        exportLimitTargetSolarWatts,
        generationLimitWatts,
        targetSolarWatts,
        targetSolarPowerRatio,
    });

    logger.trace(
        {
            disconnect,
            siteWatts,
            solarWatts,
            exportLimitWatts,
            exportLimitTargetSolarWatts,
            generationLimitWatts,
            targetSolarWatts,
            targetSolarPowerRatio: roundToDecimals(targetSolarPowerRatio, 4),
        },
        'calculated values',
    );

    if (energize === false) {
        return { type: 'deenergize' };
    }

    if (connect === false) {
        return { type: 'disconnect' };
    }

    return {
        type: 'limit',
        invertersCount: maxInvertersCount,
        targetSolarWatts,
        targetSolarPowerRatio: roundToDecimals(targetSolarPowerRatio, 4),
        batteryControl,
    };
}

export function getWMaxLimPctFromTargetSolarPowerRatio({
    targetSolarPowerRatio,
    controlsModel,
}: {
    targetSolarPowerRatio: number;
    controlsModel: Pick<ControlsModel, 'WMaxLimPct_SF'>;
}) {
    return Math.round(
        numberWithPow10(
            Decimal.min(
                new Decimal(targetSolarPowerRatio),
                1, // cap maximum to 1
            )
                .times(100)
                .toNumber(),
            -controlsModel.WMaxLimPct_SF,
        ),
    );
}

export function calculateTargetSolarPowerRatio({
    nameplateMaxW,
    targetSolarWatts,
}: {
    nameplateMaxW: number;
    targetSolarWatts: number;
}) {
    if (nameplateMaxW === 0) {
        return 0;
    }

    const targetPowerRatio = new Decimal(targetSolarWatts).div(nameplateMaxW);

    // cap the target power ratio to 1.0
    return targetPowerRatio.clamp(0, 1).toNumber();
}

// calculate the target solar power to meet the export limit
// note: this may return a value higher than what the PV/inverter is able to produce
// we don't want to make any assumptions about the max capabilities of the inverter due to overclocking
export function calculateTargetSolarWatts({
    solarWatts,
    siteWatts,
    exportLimitWatts,
}: {
    solarWatts: number;
    // the power usage at the site
    // positive = import power
    // negative = export power
    siteWatts: number;
    exportLimitWatts: number;
}) {
    const changeToMeetExportLimit = new Decimal(-siteWatts).sub(
        exportLimitWatts,
    );
    const solarTarget = new Decimal(solarWatts).sub(changeToMeetExportLimit);

    return solarTarget.toNumber();
}

export type ControlLimitsBySetpoint = Record<
    SetpointKeys,
    InverterControlLimit | null
>;

export type ActiveInverterControlLimit = {
    opModEnergize:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    opModConnect:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    opModGenLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModExpLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModImpLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModLoadLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryChargeRatePercent:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryDischargeRatePercent:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryStorageMode:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryTargetSocPercent:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryImportTargetWatts:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryExportTargetWatts:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batterySocMinPercent:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batterySocMaxPercent:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryChargeMaxWatts:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryDischargeMaxWatts:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    batteryPriorityMode:
        | {
              value: 'export_first' | 'battery_first';
              source: InverterControlTypes;
          }
        | undefined;
    batteryGridChargingEnabled:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    batteryGridChargingMaxWatts:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
};

export function getActiveInverterControlLimit(
    controlLimits: (InverterControlLimit | null)[],
): ActiveInverterControlLimit {
    let opModEnergize: ActiveInverterControlLimit['opModEnergize'] = undefined;
    let opModConnect: ActiveInverterControlLimit['opModConnect'] = undefined;
    let opModGenLimW: ActiveInverterControlLimit['opModGenLimW'] = undefined;
    let opModExpLimW: ActiveInverterControlLimit['opModExpLimW'] = undefined;
    let opModImpLimW: ActiveInverterControlLimit['opModImpLimW'] = undefined;
    let opModLoadLimW: ActiveInverterControlLimit['opModLoadLimW'] = undefined;
    let batteryChargeRatePercent: ActiveInverterControlLimit['batteryChargeRatePercent'] =
        undefined;
    let batteryDischargeRatePercent: ActiveInverterControlLimit['batteryDischargeRatePercent'] =
        undefined;
    let batteryStorageMode: ActiveInverterControlLimit['batteryStorageMode'] =
        undefined;
    let batteryTargetSocPercent: ActiveInverterControlLimit['batteryTargetSocPercent'] =
        undefined;
    let batteryImportTargetWatts: ActiveInverterControlLimit['batteryImportTargetWatts'] =
        undefined;
    let batteryExportTargetWatts: ActiveInverterControlLimit['batteryExportTargetWatts'] =
        undefined;
    let batterySocMinPercent: ActiveInverterControlLimit['batterySocMinPercent'] =
        undefined;
    let batterySocMaxPercent: ActiveInverterControlLimit['batterySocMaxPercent'] =
        undefined;
    let batteryChargeMaxWatts: ActiveInverterControlLimit['batteryChargeMaxWatts'] =
        undefined;
    let batteryDischargeMaxWatts: ActiveInverterControlLimit['batteryDischargeMaxWatts'] =
        undefined;
    let batteryPriorityMode: ActiveInverterControlLimit['batteryPriorityMode'] =
        undefined;
    let batteryGridChargingEnabled: ActiveInverterControlLimit['batteryGridChargingEnabled'] =
        undefined;
    let batteryGridChargingMaxWatts: ActiveInverterControlLimit['batteryGridChargingMaxWatts'] =
        undefined;

    for (const controlLimit of controlLimits) {
        if (!controlLimit) {
            continue;
        }

        if (controlLimit.opModEnergize !== undefined) {
            if (
                opModEnergize === undefined ||
                // false overrides true
                (opModEnergize.value === true &&
                    controlLimit.opModEnergize === false)
            ) {
                opModEnergize = {
                    source: controlLimit.source,
                    value: controlLimit.opModEnergize,
                };
            }
        }

        if (controlLimit.opModConnect !== undefined) {
            if (
                opModConnect === undefined ||
                // false overrides true
                (opModConnect.value === true &&
                    controlLimit.opModConnect === false)
            ) {
                opModConnect = {
                    source: controlLimit.source,
                    value: controlLimit.opModConnect,
                };
            }
        }

        if (controlLimit.opModGenLimW !== undefined) {
            if (
                opModGenLimW === undefined ||
                // take the lesser value
                controlLimit.opModGenLimW < opModGenLimW.value
            ) {
                opModGenLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModGenLimW,
                };
            }
        }

        if (controlLimit.opModExpLimW !== undefined) {
            if (
                opModExpLimW === undefined ||
                // take the lesser value
                controlLimit.opModExpLimW < opModExpLimW.value
            ) {
                opModExpLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModExpLimW,
                };
            }
        }

        if (controlLimit.opModImpLimW !== undefined) {
            if (
                opModImpLimW === undefined ||
                // take the lesser value
                controlLimit.opModImpLimW < opModImpLimW.value
            ) {
                opModImpLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModImpLimW,
                };
            }
        }

        if (controlLimit.opModLoadLimW !== undefined) {
            if (
                opModLoadLimW === undefined ||
                // take the lesser value
                controlLimit.opModLoadLimW < opModLoadLimW.value
            ) {
                opModLoadLimW = {
                    source: controlLimit.source,
                    value: controlLimit.opModLoadLimW,
                };
            }
        }

        // Battery control attributes - use most restrictive values
        if (controlLimit.batteryChargeRatePercent !== undefined) {
            if (
                batteryChargeRatePercent === undefined ||
                controlLimit.batteryChargeRatePercent <
                    batteryChargeRatePercent.value
            ) {
                batteryChargeRatePercent = {
                    source: controlLimit.source,
                    value: controlLimit.batteryChargeRatePercent,
                };
            }
        }

        if (controlLimit.batteryDischargeRatePercent !== undefined) {
            if (
                batteryDischargeRatePercent === undefined ||
                controlLimit.batteryDischargeRatePercent <
                    batteryDischargeRatePercent.value
            ) {
                batteryDischargeRatePercent = {
                    source: controlLimit.source,
                    value: controlLimit.batteryDischargeRatePercent,
                };
            }
        }

        if (controlLimit.batteryStorageMode !== undefined) {
            batteryStorageMode = {
                source: controlLimit.source,
                value: controlLimit.batteryStorageMode,
            };
        }

        if (controlLimit.batteryTargetSocPercent !== undefined) {
            batteryTargetSocPercent = {
                source: controlLimit.source,
                value: controlLimit.batteryTargetSocPercent,
            };
        }

        if (controlLimit.batteryImportTargetWatts !== undefined) {
            batteryImportTargetWatts = {
                source: controlLimit.source,
                value: controlLimit.batteryImportTargetWatts,
            };
        }

        if (controlLimit.batteryExportTargetWatts !== undefined) {
            batteryExportTargetWatts = {
                source: controlLimit.source,
                value: controlLimit.batteryExportTargetWatts,
            };
        }

        if (controlLimit.batterySocMinPercent !== undefined) {
            if (
                batterySocMinPercent === undefined ||
                controlLimit.batterySocMinPercent > batterySocMinPercent.value
            ) {
                batterySocMinPercent = {
                    source: controlLimit.source,
                    value: controlLimit.batterySocMinPercent,
                };
            }
        }

        if (controlLimit.batterySocMaxPercent !== undefined) {
            if (
                batterySocMaxPercent === undefined ||
                controlLimit.batterySocMaxPercent < batterySocMaxPercent.value
            ) {
                batterySocMaxPercent = {
                    source: controlLimit.source,
                    value: controlLimit.batterySocMaxPercent,
                };
            }
        }

        if (controlLimit.batteryChargeMaxWatts !== undefined) {
            if (
                batteryChargeMaxWatts === undefined ||
                controlLimit.batteryChargeMaxWatts < batteryChargeMaxWatts.value
            ) {
                batteryChargeMaxWatts = {
                    source: controlLimit.source,
                    value: controlLimit.batteryChargeMaxWatts,
                };
            }
        }

        if (controlLimit.batteryDischargeMaxWatts !== undefined) {
            if (
                batteryDischargeMaxWatts === undefined ||
                controlLimit.batteryDischargeMaxWatts <
                    batteryDischargeMaxWatts.value
            ) {
                batteryDischargeMaxWatts = {
                    source: controlLimit.source,
                    value: controlLimit.batteryDischargeMaxWatts,
                };
            }
        }

        if (controlLimit.batteryPriorityMode !== undefined) {
            batteryPriorityMode = {
                source: controlLimit.source,
                value: controlLimit.batteryPriorityMode,
            };
        }

        if (controlLimit.batteryGridChargingEnabled !== undefined) {
            if (
                batteryGridChargingEnabled === undefined ||
                // false overrides true for safety
                (batteryGridChargingEnabled.value === true &&
                    controlLimit.batteryGridChargingEnabled === false)
            ) {
                batteryGridChargingEnabled = {
                    source: controlLimit.source,
                    value: controlLimit.batteryGridChargingEnabled,
                };
            }
        }

        if (controlLimit.batteryGridChargingMaxWatts !== undefined) {
            if (
                batteryGridChargingMaxWatts === undefined ||
                controlLimit.batteryGridChargingMaxWatts <
                    batteryGridChargingMaxWatts.value
            ) {
                batteryGridChargingMaxWatts = {
                    source: controlLimit.source,
                    value: controlLimit.batteryGridChargingMaxWatts,
                };
            }
        }
    }

    return {
        opModEnergize,
        opModConnect,
        opModGenLimW,
        opModExpLimW,
        opModImpLimW,
        opModLoadLimW,
        batteryChargeRatePercent,
        batteryDischargeRatePercent,
        batteryStorageMode,
        batteryTargetSocPercent,
        batteryImportTargetWatts,
        batteryExportTargetWatts,
        batterySocMinPercent,
        batterySocMaxPercent,
        batteryChargeMaxWatts,
        batteryDischargeMaxWatts,
        batteryPriorityMode,
        batteryGridChargingEnabled,
        batteryGridChargingMaxWatts,
    };
}

export function adjustActiveInverterControlForBatteryCharging({
    activeInverterControlLimit,
    batteryChargeBufferWatts,
}: {
    activeInverterControlLimit: ActiveInverterControlLimit;
    batteryChargeBufferWatts: number;
}): ActiveInverterControlLimit {
    if (
        activeInverterControlLimit.opModExpLimW !== undefined &&
        activeInverterControlLimit.opModExpLimW.value < batteryChargeBufferWatts
    ) {
        // adjust the export limit value to the battery charge buffer watts
        return {
            ...activeInverterControlLimit,
            opModExpLimW: {
                source: 'batteryChargeBuffer',
                value: batteryChargeBufferWatts,
            },
        };
    }

    return activeInverterControlLimit;
}
