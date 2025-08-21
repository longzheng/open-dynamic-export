import { type InverterData } from '../inverterData.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import { type InverterConfiguration } from '../../coordinator/helpers/inverterController.js';
import { type Config } from '../../helpers/config.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { Decimal } from 'decimal.js';
import { SmaConnection } from '../../connections/modbus/connection/sma.js';
import { type SmaCore1GridMsModels } from '../../connections/modbus/models/sma/core1/gridMs.js';
import { type SmaCore1InverterModels } from '../../connections/modbus/models/sma/core1/inverter.js';
import {
    type SmaCore1InverterControlModels,
    type SmaCore1InverterControl2,
} from '../../connections/modbus/models/sma/core1/inverterControl.js';
import {
    SmaCore1InverterControlWModCfgWMod,
    SmaCore1InverterControlFstStop,
} from '../../connections/modbus/models/sma/core1/inverterControl.js';
import { type SmaCore1Nameplate } from '../../connections/modbus/models/sma/core1/nameplate.js';
import { type SmaCore1Operation } from '../../connections/modbus/models/sma/core1/operation.js';
import { SmaCore1OperationGriSwStt } from '../../connections/modbus/models/sma/core1/operation.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';
import { withAbortCheck } from '../../helpers/withAbortCheck.js';

export class SmaInverterDataPoller extends InverterDataPollerBase {
    private smaConnection: SmaConnection;
    private cachedControlsModel: SmaCore1InverterControlModels | null = null;

    constructor({
        smaInverterConfig,
        inverterIndex,
        applyControl,
    }: {
        smaInverterConfig: Extract<
            Config['inverters'][number],
            { type: 'sma' }
        >;
        inverterIndex: number;
        applyControl: boolean;
    }) {
        super({
            name: 'SmaInverterDataPoller',
            pollingIntervalMs: smaInverterConfig.pollingIntervalMs,
            applyControl,
            inverterIndex,
        });

        this.smaConnection = new SmaConnection(smaInverterConfig);

        void this.startPolling();
    }

    override async getInverterData(): Promise<InverterData> {
        const start = performance.now();

        const models: InverterModels = {
            inverter: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.smaConnection.getInverterModel(),
            }),
            nameplate: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.smaConnection.getNameplateModel(),
            }),
            operation: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.smaConnection.getOperationModel(),
            }),
            gridMs: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.smaConnection.getGridMsModel(),
            }),
            inverterControl: await withAbortCheck({
                signal: this.abortController.signal,
                fn: () => this.smaConnection.getInverterControlModel(),
            }),
        };

        const end = performance.now();
        const duration = end - start;

        this.logger.trace({ duration, models }, 'Got inverter data');

        this.cachedControlsModel = models.inverterControl;

        const inverterData = generateInverterData(models);

        return inverterData;
    }

    override onDestroy(): void {
        this.smaConnection.onDestroy();
    }

    override async onControl(
        inverterConfiguration: InverterConfiguration,
    ): Promise<void> {
        if (!this.cachedControlsModel) {
            return;
        }

        const writeControlsModel = gemerateSmaCore1InverterControl2({
            inverterConfiguration,
        });

        if (this.applyControl) {
            try {
                const desiredWModCfg_WMod =
                    SmaCore1InverterControlWModCfgWMod.ExternalSetting;

                // only change WModCfg_WMod if the value is not already set
                // this register cannot be written cyclically so it should only be written if necessary
                if (
                    this.cachedControlsModel.WModCfg_WMod !==
                    desiredWModCfg_WMod
                ) {
                    await this.smaConnection.writeInverterControlModel1({
                        WModCfg_WMod: desiredWModCfg_WMod,
                    });
                }

                await this.smaConnection.writeInverterControlModel2(
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

type InverterModels = {
    inverter: SmaCore1InverterModels;
    nameplate: SmaCore1Nameplate;
    operation: SmaCore1Operation;
    gridMs: SmaCore1GridMsModels;
    inverterControl: SmaCore1InverterControlModels;
};

export function generateInverterData({
    inverter,
    gridMs,
    operation,
}: InverterModels): InverterData {
    const inverterW = gridMs.TotW;

    return {
        date: new Date(),
        inverter: {
            realPower: inverterW,
            reactivePower:
                (gridMs.VAr_phsA ?? 0) +
                (gridMs.VAr_phsB ?? 0) +
                (gridMs.VAr_phsC ?? 0),
            voltagePhaseA: gridMs.PhV_phsA,
            voltagePhaseB: gridMs.PhV_phsB,
            voltagePhaseC: gridMs.PhV_phsC,
            frequency: gridMs.Hz,
        },
        nameplate: {
            type: DERTyp.PV,
            maxW: inverter.WLim,
            maxVA: inverter.VAMaxOutRtg,
            maxVar: inverter.VArMaxQ1Rtg,
        },
        settings: {
            maxW: inverter.WLim,
            maxVA: inverter.VAMaxOutRtg,
            maxVar: inverter.VArMaxQ1Rtg,
        },
        status: generateInverterDataStatus({
            operation,
            inverterW,
        }),
    };
}

export function generateInverterDataStatus({
    operation,
    inverterW,
}: {
    operation: SmaCore1Operation;
    inverterW: number;
}): InverterData['status'] {
    const isClosed = operation.GriSwStt === SmaCore1OperationGriSwStt.Closed;

    return {
        operationalModeStatus: isClosed
            ? OperationalModeStatusValue.OperationalMode
            : OperationalModeStatusValue.Off,
        genConnectStatus: isClosed
            ? ConnectStatusValue.Available |
              ConnectStatusValue.Connected |
              (inverterW > 0
                  ? ConnectStatusValue.Operating
                  : (0 as ConnectStatusValue))
            : (0 as ConnectStatusValue),
    };
}

export function gemerateSmaCore1InverterControl2({
    inverterConfiguration,
}: {
    inverterConfiguration: InverterConfiguration;
}): SmaCore1InverterControl2 {
    switch (inverterConfiguration.type) {
        case 'disconnect':
            return {
                FstStop: SmaCore1InverterControlFstStop.Stop,
                WModCfg_WCtlComCfg_WNomPrc: 0,
            };
        case 'deenergize':
            return {
                FstStop: SmaCore1InverterControlFstStop.Start,
                // effectively cap output to 0%
                WModCfg_WCtlComCfg_WNomPrc: 0,
            };
        case 'limit':
            return {
                FstStop: SmaCore1InverterControlFstStop.Start,
                // value in % with two decimal places
                WModCfg_WCtlComCfg_WNomPrc: Math.round(
                    numberWithPow10(
                        Decimal.min(
                            new Decimal(
                                inverterConfiguration.targetSolarPowerRatio,
                            ),
                            1, // cap maximum to 1
                        )
                            .times(100)
                            .toNumber(),
                        2,
                    ),
                ),
            };
    }
}
