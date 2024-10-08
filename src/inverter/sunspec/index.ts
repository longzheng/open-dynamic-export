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
import {
    InverterState,
    type InverterModel,
} from '../../sunspec/models/inverter.js';
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
import { withRetry } from '../../helpers/withRetry.js';
import { writeLatency } from '../../helpers/influxdb.js';

export class SunSpecInverterDataPoller extends InverterDataPollerBase {
    private inverterConnection: InverterSunSpecConnection;
    private cachedControlsModel: ControlsModel | null = null;
    private sunSpecInverterIndex: number;

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
            pollingIntervalMs: 200,
            applyControl,
            inverterIndex,
        });

        this.inverterConnection = getSunSpecInvertersConnection(
            sunspecInverterConfig,
        );
        this.sunSpecInverterIndex = inverterIndex;

        void this.startPolling();
    }

    override async getInverterData(): Promise<Result<InverterData>> {
        try {
            return await withRetry(
                async () => {
                    const start = performance.now();

                    const inverterModel =
                        await this.inverterConnection.getInverterModel();

                    writeLatency({
                        field: 'sunSpecInverterDataPoller',
                        duration: performance.now() - start,
                        tags: {
                            inverterIndex: this.sunSpecInverterIndex.toString(),
                            model: 'inverter',
                        },
                    });

                    const nameplateModel =
                        await this.inverterConnection.getNameplateModel();

                    writeLatency({
                        field: 'sunSpecInverterDataPoller',
                        duration: performance.now() - start,
                        tags: {
                            inverterIndex: this.sunSpecInverterIndex.toString(),
                            model: 'nameplate',
                        },
                    });

                    const settingsModel =
                        await this.inverterConnection.getSettingsModel();

                    writeLatency({
                        field: 'sunSpecInverterDataPoller',
                        duration: performance.now() - start,
                        tags: {
                            inverterIndex: this.sunSpecInverterIndex.toString(),
                            model: 'settings',
                        },
                    });

                    const statusModel =
                        await this.inverterConnection.getStatusModel();

                    writeLatency({
                        field: 'sunSpecInverterDataPoller',
                        duration: performance.now() - start,
                        tags: {
                            inverterIndex: this.sunSpecInverterIndex.toString(),
                            model: 'status',
                        },
                    });

                    const controlsModel =
                        await this.inverterConnection.getControlsModel();

                    writeLatency({
                        field: 'sunSpecInverterDataPoller',
                        duration: performance.now() - start,
                        tags: {
                            inverterIndex: this.sunSpecInverterIndex.toString(),
                            model: 'controls',
                        },
                    });

                    const models = {
                        inverter: inverterModel,
                        nameplate: nameplateModel,
                        settings: settingsModel,
                        status: statusModel,
                        controls: controlsModel,
                    };

                    const end = performance.now();
                    const duration = end - start;

                    this.logger.trace(
                        { duration, models },
                        'Got inverter data',
                    );

                    this.cachedControlsModel = models.controls;

                    const inverterData = generateInverterData(models);

                    return {
                        success: true,
                        value: inverterData,
                    };
                },
                {
                    attempts: 3,
                    delayMilliseconds: 100,
                    functionName: 'get inverter data',
                },
            );
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
