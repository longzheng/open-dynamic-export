import { type InverterData } from '../inverterData.js';
import { enumHasValue } from '../../helpers/enum.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import {
    getWMaxLimPctFromTargetSolarPowerRatio,
    type InverterConfiguration,
} from '../../coordinator/helpers/inverterController.js';
import { type Config } from '../../helpers/config.js';
import { InverterSunSpecConnection } from '../../connections/sunspec/connection/inverter.js';
import { getInverterMetrics } from '../../connections/sunspec/helpers/inverterMetrics.js';
import { getNameplateMetrics } from '../../connections/sunspec/helpers/nameplateMetrics.js';
import { getSettingsMetrics } from '../../connections/sunspec/helpers/settingsMetrics.js';
import { getStatusMetrics } from '../../connections/sunspec/helpers/statusMetrics.js';
import {
    type ControlsModel,
    type ControlsModelWrite,
} from '../../connections/sunspec/models/controls.js';
import {
    Conn,
    WMaxLim_Ena,
    VArPct_Ena,
    OutPFSet_Ena,
} from '../../connections/sunspec/models/controls.js';
import { type InverterModel } from '../../connections/sunspec/models/inverter.js';
import { InverterState } from '../../connections/sunspec/models/inverter.js';
import { type NameplateModel } from '../../connections/sunspec/models/nameplate.js';
import { type SettingsModel } from '../../connections/sunspec/models/settings.js';
import { type StatusModel } from '../../connections/sunspec/models/status.js';
import { type StorageModel } from '../../connections/sunspec/models/storage.js';
import { PVConn } from '../../connections/sunspec/models/status.js';
import { withAbortCheck } from '../../helpers/withAbortCheck.js';

export class SunSpecInverterDataPoller extends InverterDataPollerBase {
    private inverterConnection: InverterSunSpecConnection;
    private batteryControlEnabled: boolean;

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
                      fn: () => this.inverterConnection.getStorageModel(),
                  }).catch(() => null)
                : null, // Gracefully handle if storage model is not available
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
                await this.inverterConnection.writeControlsModel(
                    writeControlsModel,
                );
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
}: {
    inverter: InverterModel;
    nameplate: NameplateModel;
    settings: SettingsModel;
    status: StatusModel;
    storage: StorageModel | null;
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
        storage: storage ? generateInverterDataStorage({ storage }) : undefined,
    };
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

export function generateInverterDataStorage({
    storage,
}: {
    storage: StorageModel;
}): NonNullable<InverterData['storage']> {
    // Apply scale factors to get the actual values
    const capacity = storage.WChaMax * Math.pow(10, storage.WChaMax_SF);
    const maxChargeRate =
        storage.WChaGra * Math.pow(10, storage.WChaDisChaGra_SF);
    const maxDischargeRate =
        storage.WDisChaGra * Math.pow(10, storage.WChaDisChaGra_SF);
    const stateOfCharge =
        storage.ChaState !== null && storage.ChaState_SF !== null
            ? storage.ChaState * Math.pow(10, storage.ChaState_SF)
            : null;
    const chargeRate =
        storage.InWRte !== null && storage.InOutWRte_SF !== null
            ? storage.InWRte * Math.pow(10, storage.InOutWRte_SF)
            : null;
    const dischargeRate =
        storage.OutWRte !== null && storage.InOutWRte_SF !== null
            ? storage.OutWRte * Math.pow(10, storage.InOutWRte_SF)
            : null;

    return {
        capacity,
        maxChargeRate,
        maxDischargeRate,
        stateOfCharge,
        chargeStatus: storage.ChaSt,
        storageMode: storage.StorCtl_Mod,
        chargeRate,
        dischargeRate,
    };
}
