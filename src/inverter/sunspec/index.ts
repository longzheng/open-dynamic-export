import { type InverterData } from '../inverterData.js';
import { enumHasValue } from '../../helpers/enum.js';
import type { Result } from '../../helpers/result.js';
import { ConnectStatus } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatus } from '../../sep2/models/operationModeStatus.js';
import type { InverterSunSpecConnection } from '../../sunspec/connection/inverter.js';
import { getInverterMetrics } from '../../sunspec/helpers/inverterMetrics.js';
import { getNameplateMetrics } from '../../sunspec/helpers/nameplateMetrics.js';
import { getSettingsMetrics } from '../../sunspec/helpers/settingsMetrics.js';
import { getStatusMetrics } from '../../sunspec/helpers/statusMetrics.js';
import {
    Conn,
    OutPFSet_Ena,
    VArPct_Ena,
    WMaxLim_Ena,
    type ControlsModel,
    type ControlsModelWrite,
} from '../../sunspec/models/controls.js';
import type { InverterModel } from '../../sunspec/models/inverter.js';
import type { NameplateModel } from '../../sunspec/models/nameplate.js';
import type { SettingsModel } from '../../sunspec/models/settings.js';
import type { StatusModel } from '../../sunspec/models/status.js';
import { PVConn } from '../../sunspec/models/status.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import {
    getWMaxLimPctFromTargetSolarPowerRatio,
    type InverterConfiguration,
} from '../../coordinator/helpers/inverterController.js';
import type { Config } from '../../helpers/config.js';
import { getSunSpecInvertersConnection } from '../../sunspec/connections.js';

export class SunSpecInverterDataPoller extends InverterDataPollerBase {
    private inverterConnection: InverterSunSpecConnection;
    private cachedControlsModel: ControlsModel | null = null;

    constructor({
        sunspecInverterConfig,
        applyControl,
    }: {
        sunspecInverterConfig: Extract<
            Config['inverters'][number],
            { type: 'sunspec' }
        >;
        applyControl: boolean;
    }) {
        super({
            name: 'SunSpecInverterDataPoller',
            pollingIntervalMs: 200,
            applyControl,
        });

        this.inverterConnection = getSunSpecInvertersConnection(
            sunspecInverterConfig,
        );

        void this.startPolling();
    }

    override async getInverterData(): Promise<Result<InverterData>> {
        try {
            const models = {
                inverter: await this.inverterConnection.getInverterModel(),
                nameplate: await this.inverterConnection.getNameplateModel(),
                settings: await this.inverterConnection.getSettingsModel(),
                status: await this.inverterConnection.getStatusModel(),
                controls: await this.inverterConnection.getControlsModel(),
            };

            this.logger.trace({ models }, 'received model data');

            this.cachedControlsModel = models.controls;

            const inverterData = generateInverterData(models);

            return {
                success: true,
                value: inverterData,
            };
        } catch (error) {
            this.logger.error(error, 'Failed to get inverter data');

            return {
                success: false,
                error: new Error(
                    `Error loading inverter data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                ),
            };
        }
    }

    override onDestroy(): void {
        this.inverterConnection.client.close(() => {});
    }

    override async onControl(
        inverterConfiguration: InverterConfiguration,
    ): Promise<void> {
        if (!this.cachedControlsModel) {
            return;
        }

        const writeControlsModel =
            generateControlsModelWriteFromInverterConfiguration({
                inverterConfiguration,
                controlsModel: this.cachedControlsModel,
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
}: {
    inverter: InverterModel;
    nameplate: NameplateModel;
    settings: SettingsModel;
    status: StatusModel;
}): InverterData {
    const inverterMetrics = getInverterMetrics(inverter);
    const nameplateMetrics = getNameplateMetrics(nameplate);
    const settingsMetrics = getSettingsMetrics(settings);

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
        status: generateInverterDataStatus({ status }),
    };
}

export function generateInverterDataStatus({
    status,
}: {
    status: StatusModel;
}): InverterData['status'] {
    const statusMetrics = getStatusMetrics(status);

    return {
        operationalModeStatus: enumHasValue(
            statusMetrics.PVConn,
            PVConn.CONNECTED,
        )
            ? OperationalModeStatus.OperationalMode
            : OperationalModeStatus.Off,
        genConnectStatus: getGenConnectStatusFromPVConn(statusMetrics.PVConn),
    };
}

export function getGenConnectStatusFromPVConn(pvConn: PVConn): ConnectStatus {
    let result: ConnectStatus = 0 as ConnectStatus;

    if (enumHasValue(pvConn, PVConn.CONNECTED)) {
        result += ConnectStatus.Connected;
    } else {
        return result;
    }

    if (enumHasValue(pvConn, PVConn.AVAILABLE)) {
        result += ConnectStatus.Available;
    } else {
        return result;
    }

    if (enumHasValue(pvConn, PVConn.OPERATING)) {
        result += ConnectStatus.Operating;
    } else {
        return result;
    }

    if (enumHasValue(pvConn, PVConn.TEST)) {
        result += ConnectStatus.Test;
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
                VArPct_Ena: VArPct_Ena.DISABLED,
                OutPFSet_Ena: OutPFSet_Ena.DISABLED,
            };
        case 'limit':
            return {
                ...controlsModel,
                Conn: Conn.CONNECT,
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
