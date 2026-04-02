import type { InverterData } from '../inverterData.js';
import { enumHasValue } from '../../helpers/enum.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import {
    getWMaxLimPctFromTargetSolarPowerRatio,
    type InverterConfiguration,
    type BatteryControlConfiguration,
} from '../../coordinator/helpers/inverterController.js';
import type { Config } from '../../helpers/config.js';
import { InverterSunSpecConnection } from '../../connections/sunspec/connection/inverter.js';
import { getInverterMetrics } from '../../connections/sunspec/helpers/inverterMetrics.js';
import { getNameplateMetrics } from '../../connections/sunspec/helpers/nameplateMetrics.js';
import { getSettingsMetrics } from '../../connections/sunspec/helpers/settingsMetrics.js';
import { getStatusMetrics } from '../../connections/sunspec/helpers/statusMetrics.js';
import { getStorageMetrics } from '../../connections/sunspec/helpers/storageMetrics.js';
import type {
    ControlsModel,
    ControlsModelWrite,
} from '../../connections/sunspec/models/controls.js';
import {
    Conn,
    WMaxLim_Ena,
    VArPct_Ena,
    OutPFSet_Ena,
} from '../../connections/sunspec/models/controls.js';
import type { InverterModel } from '../../connections/sunspec/models/inverter.js';
import { InverterState } from '../../connections/sunspec/models/inverter.js';
import type { NameplateModel } from '../../connections/sunspec/models/nameplate.js';
import type { SettingsModel } from '../../connections/sunspec/models/settings.js';
import type { StatusModel } from '../../connections/sunspec/models/status.js';
import type {
    StorageModel,
    StorageModelWrite,
} from '../../connections/sunspec/models/storage.js';
import { StorCtl_Mod } from '../../connections/sunspec/models/storage.js';
import type {
    MpptModel,
    MpptModuleModel,
} from '../../connections/sunspec/models/mppt.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { PVConn } from '../../connections/sunspec/models/status.js';
import { withAbortCheck } from '../../helpers/withAbortCheck.js';

export class SunSpecInverterDataPoller extends InverterDataPollerBase {
    private inverterConnection: InverterSunSpecConnection;
    private batteryControlEnabled: boolean;
    private hasStorageCapability: boolean | null = null; // null = unknown, true/false = determined

    constructor({
        sunspecInverterConfig,
        inverterIndex,
        applyControl,
    }: {
        sunspecInverterConfig: Extract<
            Config['inverters'][number],
            { type: 'sunspec' }
        >;
        inverterIndex: number;
        applyControl: boolean;
    }) {
        super({
            name: 'SunSpecInverterDataPoller',
            pollingIntervalMs: sunspecInverterConfig.pollingIntervalMs,
            applyControl,
            inverterIndex,
        });

        this.batteryControlEnabled =
            sunspecInverterConfig.batteryControlEnabled ?? false;

        this.inverterConnection = new InverterSunSpecConnection(
            sunspecInverterConfig,
        );

        void this.startPolling();
    }

    override async getInverterData(): Promise<InverterData> {
        const start = performance.now();

        const models = {
            inverter: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.inverterConnection.getInverterModel(),
            }),
            nameplate: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.inverterConnection.getNameplateModel(),
            }),
            settings: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.inverterConnection.getSettingsModel(),
            }),
            status: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.inverterConnection.getStatusModel(),
            }),
            controls: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.inverterConnection.getControlsModel(),
            }),
            storage: this.batteryControlEnabled
                ? await withAbortCheck({
                      signal: this.abortController.signal,
                      fn: async () => {
                          try {
                              const storage =
                                  await this.inverterConnection.getStorageModel();
                              // Successfully got storage model - this inverter has battery capability
                              if (this.hasStorageCapability === null) {
                                  this.hasStorageCapability = true;
                                  this.logger.info(
                                      'Inverter has battery storage capability',
                                  );
                              }
                              return storage;
                          } catch {
                              // Storage model is optional - inverter may not have battery capability
                              if (this.hasStorageCapability === null) {
                                  this.hasStorageCapability = false;
                                  this.logger.warn(
                                      'Inverter does not have battery storage capability',
                                  );
                              }
                              return null;
                          }
                      },
                  })
                : null,
            mppt: this.batteryControlEnabled
                ? await withAbortCheck({
                      signal: this.abortController.signal,
                      fn: async () => {
                          try {
                              return await this.inverterConnection.getMpptModel();
                          } catch {
                              this.logger.warn(
                                  'Failed to read MPPT model for battery power measurement',
                              );
                              return null;
                          }
                      },
                  })
                : null,
        };

        const end = performance.now();
        const duration = end - start;

        this.logger.trace({ duration, models }, 'Got inverter data');

        const inverterData = generateInverterData(models);

        return inverterData;
    }

    override onDestroy(): void {
        this.inverterConnection.onDestroy();
    }

    override async onControl(
        inverterConfiguration: InverterConfiguration,
    ): Promise<void> {
        const controlsModel = await this.inverterConnection.getControlsModel();

        const writeControlsModel =
            generateControlsModelWriteFromInverterConfiguration({
                inverterConfiguration,
                controlsModel,
            });

        if (this.applyControl) {
            try {
                // Write inverter controls (solar generation limits)
                await this.inverterConnection.writeControlsModel(
                    writeControlsModel,
                );

                this.logger.info(
                    {
                        writeControlsModel,
                    },
                    'Wrote inverter controls',
                );

                // Write battery controls if present and battery control is enabled
                if (
                    this.batteryControlEnabled &&
                    this.hasStorageCapability === true &&
                    inverterConfiguration.type === 'limit' &&
                    inverterConfiguration.batteryControl
                ) {
                    try {
                        const storageModel =
                            await this.inverterConnection.getStorageModel();

                        const writeStorageModel =
                            generateStorageModelWriteFromBatteryControl({
                                batteryControl:
                                    inverterConfiguration.batteryControl,
                                storageModel,
                            });

                        await this.inverterConnection.writeStorageModel(
                            writeStorageModel,
                        );

                        this.logger.info(
                            {
                                batteryControl:
                                    inverterConfiguration.batteryControl,
                                writeStorageModel,
                            },
                            'Wrote battery controls',
                        );
                    } catch (error) {
                        this.logger.error(
                            error,
                            'Error writing battery storage controls',
                        );
                    }
                } else if (
                    this.batteryControlEnabled &&
                    this.hasStorageCapability === false &&
                    inverterConfiguration.type === 'limit' &&
                    inverterConfiguration.batteryControl
                ) {
                    // Log that battery control was requested but this inverter doesn't have storage
                    this.logger.debug(
                        {
                            inverterIndex: this.inverterIndex,
                            batteryControl:
                                inverterConfiguration.batteryControl,
                        },
                        'Battery control requested but inverter does not have storage capability - skipping',
                    );
                }
            } catch (error) {
                this.logger.error(
                    error,
                    'Error writing inverter controls value',
                );
            }
        }
    }
}

export function generateInverterData({
    inverter,
    nameplate,
    settings,
    status,
    storage,
    mppt,
}: {
    inverter: InverterModel;
    nameplate: NameplateModel;
    settings: SettingsModel;
    status: StatusModel;
    storage: StorageModel | null;
    mppt: (MpptModel & { modules: MpptModuleModel[] }) | null;
}): InverterData {
    const inverterMetrics = getInverterMetrics(inverter);
    const nameplateMetrics = getNameplateMetrics(nameplate);
    const settingsMetrics = getSettingsMetrics(settings);

    // observed some Fronius inverters randomly spit out 0 values even though the inverter is operating normally
    // may be related to the constant polling of SunSpec Modbus?
    // ignore this state and hope the next poll will return valid data
    if (
        inverterMetrics.W === 0 &&
        inverterMetrics.Hz === 0 &&
        inverterMetrics.PhVphA === 0 &&
        inverter.St === InverterState.FAULT &&
        // normal polling shouldn't return 0 for these values
        inverter.W_SF === 0 &&
        inverter.WH === 0
    ) {
        throw new Error('Inverter returned faulty metrics');
    }

    return {
        date: new Date(),
        inverter: {
            realPower: inverterMetrics.W,
            reactivePower: inverterMetrics.VAr ?? 0,
            voltagePhaseA: inverterMetrics.PhVphA,
            voltagePhaseB: inverterMetrics.PhVphB,
            voltagePhaseC: inverterMetrics.PhVphC,
            frequency: inverterMetrics.Hz,
        },
        nameplate: {
            type: nameplate.DERTyp,
            maxW: nameplateMetrics.WRtg,
            maxVA: nameplateMetrics.VARtg,
            maxVar: nameplateMetrics.VArRtgQ1,
        },
        settings: {
            maxW: settingsMetrics.WMax,
            maxVA: settingsMetrics.VAMax,
            maxVar: settingsMetrics.VArMaxQ1,
        },
        status: generateInverterDataStatus({
            status,
            inverterW: inverterMetrics.W,
        }),
        storage: storage
            ? generateInverterDataStorage({ storage, mppt })
            : undefined,
    };
}

export function generateInverterDataStorage({
    storage,
    mppt,
}: {
    storage: StorageModel;
    mppt: (MpptModel & { modules: MpptModuleModel[] }) | null;
}): NonNullable<InverterData['storage']> {
    const storageMetrics = getStorageMetrics(storage);

    // Compute actual battery DC power from MPPT channels (auto-detected)
    const currentBatteryPowerWatts = getBatteryPowerFromMppt({ mppt });

    return {
        stateOfChargePercent: storageMetrics.ChaState,
        availableEnergyWh: storageMetrics.StorAval,
        batteryVoltage: storageMetrics.InBatV,
        chargeStatus: storageMetrics.ChaSt,
        maxChargeRateWatts: storageMetrics.WChaGra,
        maxDischargeRateWatts: storageMetrics.WDisChaGra,
        currentChargeRatePercent: storageMetrics.InWRte,
        currentDischargeRatePercent: storageMetrics.OutWRte,
        currentBatteryPowerWatts,
        minReservePercent: storageMetrics.MinRsvPct,
        gridChargingPermitted: storageMetrics.ChaGriSet,
    };
}

/**
 * Get actual battery DC power from MPPT Model 160 channels.
 *
 * NOTE: This auto-detection logic is Fronius-specific. Other SunSpec inverters
 * may represent battery MPPT channels differently.
 *
 * Fronius Gen24 exposes battery as two MPPT channels (see register map
 * Gen24_Primo_Symo_Inverter_Register_Map_Int&SF_storage_ROW.xlsx, mppt (160) sheet):
 *   - Charge channel (IDStr starts with 'StCha'): DCW > 0 when charging, 0 when discharging
 *   - Discharge channel (IDStr starts with 'StDisCha'): DCW > 0 when discharging, 0 when charging
 *
 * The N register = mppt trackers + 2 * battery inputs, so 2 MPPT + 1 battery = 4 modules.
 *
 * Returns positive for discharging, negative for charging, 0 for idle, null if unavailable.
 */
function getBatteryPowerFromMppt({
    mppt,
}: {
    mppt: (MpptModel & { modules: MpptModuleModel[] }) | null;
}): number | null {
    if (!mppt || mppt.DCW_SF === null) {
        return null;
    }

    // Auto-detect battery channels by IDStr prefix
    let chargeWatts = 0;
    let dischargeWatts = 0;
    let foundBatteryChannel = false;

    for (const module of mppt.modules) {
        if (module.IDStr === null) {
            continue;
        }

        const idStr = module.IDStr.trim();

        // 'StDisCha' must be checked before 'StCha' since 'StDisCha' contains 'StCha'
        if (idStr.startsWith('StDisCha')) {
            foundBatteryChannel = true;
            if (module.DCW !== null) {
                dischargeWatts += numberWithPow10(module.DCW, mppt.DCW_SF);
            }
        } else if (idStr.startsWith('StCha')) {
            foundBatteryChannel = true;
            if (module.DCW !== null) {
                chargeWatts += numberWithPow10(module.DCW, mppt.DCW_SF);
            }
        }
    }

    if (!foundBatteryChannel) {
        return null;
    }

    // Positive = discharging (producing power), negative = charging (consuming power)
    return dischargeWatts - chargeWatts;
}

export function generateInverterDataStatus({
    status,
    inverterW,
}: {
    status: StatusModel;
    inverterW: number;
}): InverterData['status'] {
    const statusMetrics = getStatusMetrics(status);

    return {
        operationalModeStatus: enumHasValue(
            statusMetrics.PVConn,
            PVConn.CONNECTED,
        )
            ? OperationalModeStatusValue.OperationalMode
            : OperationalModeStatusValue.Off,
        genConnectStatus: getGenConnectStatusFromPVConn({
            pvConn: statusMetrics.PVConn,
            inverterW,
        }),
    };
}

export function getGenConnectStatusFromPVConn({
    pvConn,
    inverterW,
}: {
    pvConn: PVConn;
    inverterW: number;
}): ConnectStatusValue {
    let result: ConnectStatusValue = 0 as ConnectStatusValue;

    if (enumHasValue(pvConn, PVConn.CONNECTED)) {
        result += ConnectStatusValue.Connected;
    } else {
        return result;
    }

    if (enumHasValue(pvConn, PVConn.AVAILABLE)) {
        result += ConnectStatusValue.Available;
    } else {
        return result;
    }

    if (enumHasValue(pvConn, PVConn.OPERATING) && inverterW > 0) {
        result += ConnectStatusValue.Operating;
    } else {
        return result;
    }

    if (enumHasValue(pvConn, PVConn.TEST)) {
        result += ConnectStatusValue.Test;
    } else {
        return result;
    }

    return result;
}

export function generateControlsModelWriteFromInverterConfiguration({
    inverterConfiguration,
    controlsModel,
}: {
    inverterConfiguration: InverterConfiguration;
    controlsModel: ControlsModel;
}): ControlsModelWrite {
    switch (inverterConfiguration.type) {
        case 'disconnect':
            return {
                ...controlsModel,
                Conn: Conn.DISCONNECT,
                // revert Conn in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                Conn_RvrtTms: 60,
                WMaxLim_Ena: WMaxLim_Ena.DISABLED,
                // set value to 0 to gracefully handle re-energising and calculating target power ratio
                WMaxLimPct: getWMaxLimPctFromTargetSolarPowerRatio({
                    targetSolarPowerRatio: 0,
                    controlsModel,
                }),
                // revert WMaxLimtPct in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                WMaxLimPct_RvrtTms: 60,
                VArPct_Ena: VArPct_Ena.DISABLED,
                OutPFSet_Ena: OutPFSet_Ena.DISABLED,
            };
        case 'deenergize':
            return {
                ...controlsModel,
                Conn: Conn.CONNECT,
                // revert Conn in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                Conn_RvrtTms: 60,
                WMaxLim_Ena: WMaxLim_Ena.ENABLED,
                WMaxLimPct: getWMaxLimPctFromTargetSolarPowerRatio({
                    targetSolarPowerRatio: 0,
                    controlsModel,
                }),
                // revert WMaxLimtPct in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                WMaxLimPct_RvrtTms: 60,
                VArPct_Ena: VArPct_Ena.DISABLED,
                OutPFSet_Ena: OutPFSet_Ena.DISABLED,
            };
        case 'limit':
            return {
                ...controlsModel,
                Conn: Conn.CONNECT,
                // revert Conn in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                Conn_RvrtTms: 60,
                WMaxLim_Ena: WMaxLim_Ena.ENABLED,
                WMaxLimPct: getWMaxLimPctFromTargetSolarPowerRatio({
                    targetSolarPowerRatio:
                        inverterConfiguration.targetSolarPowerRatio,
                    controlsModel,
                }),
                // revert WMaxLimtPct in 60 seconds
                // this is a safety measure in case the SunSpec connection is lost
                // we want to revert the inverter to the default which is assumed to be safe
                // we assume we will write another config witin 60 seconds to reset this timeout
                WMaxLimPct_RvrtTms: 60,
                VArPct_Ena: VArPct_Ena.DISABLED,
                OutPFSet_Ena: OutPFSet_Ena.DISABLED,
            };
    }
}

export function generateStorageModelWriteFromBatteryControl({
    batteryControl,
    storageModel,
}: {
    batteryControl: BatteryControlConfiguration;
    storageModel: StorageModel;
}): StorageModelWrite {
    // WChaMax is the reference power value (in watts, after applying scale factor)
    // InWRte/OutWRte are the actual charge/discharge setpoints as percentages of WChaMax
    // Per SunSpec Model 124:
    //   - WChaGra/WDisChaGra are ramp rates (% WChaMax/sec), NOT power setpoints
    //   - InWRte (% WChaMax) = charge rate setpoint
    //   - OutWRte (% WDisChaMax) = discharge rate setpoint
    //   - StorCtl_Mod bitfield: bit 0 = limit charge, bit 1 = limit discharge
    // Setting both bits (StorCtl_Mod=3) with InWRte/OutWRte defines a power window

    const wChaMaxWatts = numberWithPow10(
        storageModel.WChaMax,
        storageModel.WChaMax_SF,
    );

    // Scale factor for InWRte/OutWRte (default 0 if not available)
    const inOutWRteSF = storageModel.InOutWRte_SF ?? 0;

    // Convert target power from watts to percentage of WChaMax
    const targetPercent =
        wChaMaxWatts > 0
            ? (Math.abs(batteryControl.targetPowerWatts) / wChaMaxWatts) * 100
            : 0;

    // Determine charge/discharge percentages based on mode,
    // applying optional user-configured rate caps
    let chargePercent: number;
    let dischargePercent: number;

    switch (batteryControl.mode) {
        case 'charge': {
            chargePercent = Math.min(
                batteryControl.chargeRatePercent !== undefined
                    ? Math.min(targetPercent, batteryControl.chargeRatePercent)
                    : targetPercent,
                100,
            );
            dischargePercent = 0;
            break;
        }
        case 'discharge': {
            dischargePercent = Math.min(
                batteryControl.dischargeRatePercent !== undefined
                    ? Math.min(
                          targetPercent,
                          batteryControl.dischargeRatePercent,
                      )
                    : targetPercent,
                100,
            );
            // Per SunSpec Model 124, InWRte/OutWRte define a power WINDOW:
            //   InWRte = max charge rate, OutWRte = max discharge rate
            //   "Every rate between these two limits is allowed."
            // Setting InWRte=0, OutWRte=X only ALLOWS discharge but doesn't
            // force it — the battery idles if PV covers the load.
            // A negative InWRte means "minimum discharge rate", forcing the
            // battery to discharge even when surplus PV is available (for grid export).
            // Validation (e.g. Fronius): (-1)*InWRte must not exceed OutWRte,
            // so we set InWRte = -OutWRte to create a fixed-point window.
            chargePercent = -dischargePercent;
            break;
        }
        case 'idle': {
            chargePercent = 0;
            dischargePercent = 0;
            break;
        }
    }

    // Convert percentages to raw register values using scale factor
    // e.g., with SF=-2: 50% → raw 5000
    const rawInWRte = Math.round(chargePercent * Math.pow(10, -inOutWRteSF));
    const rawOutWRte = Math.round(
        dischargePercent * Math.pow(10, -inOutWRteSF),
    );

    // Always maintain storage control (StorCtl_Mod=3) when battery flow control
    // is active. For idle mode, InWRte=0 + OutWRte=0 creates a [0,0] power
    // window that holds the battery at 0W.  Releasing control (StorCtl_Mod=0)
    // would let the inverter autonomously charge/discharge, defeating the
    // calculator's intent (e.g., preventing charging during forced export).
    const storCtlMod = StorCtl_Mod.CHARGE | StorCtl_Mod.DISCHARGE;

    return {
        ...storageModel,
        StorCtl_Mod: storCtlMod,
        // Pass through existing ramp rates unchanged
        // (WChaGra/WDisChaGra are rate-of-change limits in %/sec, not setpoints)
        WChaGra: storageModel.WChaGra,
        WDisChaGra: storageModel.WDisChaGra,
        // Charge/discharge setpoints as percentage of WChaMax
        InWRte: rawInWRte,
        OutWRte: rawOutWRte,
        // Safety revert timeout — if ODE stops writing, inverter reverts to default
        InOutWRte_RvrtTms: 60,
    };
}
