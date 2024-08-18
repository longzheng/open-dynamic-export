import 'dotenv/config';
import { getConfig } from '../src/helpers/config';
import { getSunSpecConnections } from '../src/sunspec/connections';
import {
    calculateDynamicExportConfig,
    generateControlsModelWriteFromDynamicExportConfig,
} from '../src/coordinator/helpers/dynamicExport';
import type { DERControlBase } from '../src/sep2/models/derControlBase';
import { SunSpecDataEventEmitter } from '../src/coordinator/helpers/sunspecDataEventEmitter';
import { logger } from '../src/helpers/logger';

// This debugging script simulates dynamic export control (without actually sending commands to inverters)
// It polls SunSpec data and telemetry
// It logs the the calculated target solar watts and power ratio to the console

const simulatedActiveDerControlBase: DERControlBase = {
    opModExpLimW: {
        value: 10000,
        multiplier: 0,
    },
    // opModEnergize: false,
};

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataEventEmitter({
    invertersConnections,
    metersConnections,
});

sunSpecDataEventEmitter.on(
    'data',
    ({ invertersData, monitoringSample, currentAveragePowerRatio }) => {
        const dynamicExportConfig = calculateDynamicExportConfig({
            activeDerControlBase: simulatedActiveDerControlBase,
            monitoringSample,
            currentAveragePowerRatio,
        });

        const inverterControls = invertersData.map(({ controls }) =>
            generateControlsModelWriteFromDynamicExportConfig({
                config: dynamicExportConfig,
                controlsModel: controls,
            }),
        );

        logger.info(
            {
                dynamicExportConfig,
                inverterControls: inverterControls.map((controls) => ({
                    Conn: controls.Conn,
                    WMaxLimPct: controls.WMaxLimPct,
                    WMaxLim_Ena: controls.WMaxLim_Ena,
                    VArPct_Ena: controls.VArPct_Ena,
                    OutPFSet_Ena: controls.OutPFSet_Ena,
                })),
            },
            'Calculated dynamic export config',
        );

        void invertersConnections.map(async (inverter, index) => {
            const inverterData = invertersData[index];

            if (!inverterData) {
                throw new Error('Inverter data not found');
            }

            const writeControlsModel =
                generateControlsModelWriteFromDynamicExportConfig({
                    config: dynamicExportConfig,
                    controlsModel: inverterData.controls,
                });

            if (!config.sunSpec.control) {
                logger.info(
                    { model: writeControlsModel },
                    'Writing controls model',
                );

                await inverter.writeControlsModel(writeControlsModel);
            }
        });
    },
);
