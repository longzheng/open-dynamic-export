import 'dotenv/config';
import { getConfig } from '../src/config';
import { getSunSpecConnections } from '../src/sunspec/connections';
import {
    calculateDynamicExportConfig,
    generateControlsModelWriteFromDynamicExportConfig,
} from '../src/coordinator.ts/dynamicExport';
import type { DERControlBase } from '../src/sep2/models/derControlBase';
import { SunSpecDataEventEmitter } from '../src/coordinator.ts/sunspecDataEventEmitter';
import { logger } from '../src/logger';

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

// whether or not to apply the change on the inverter
const simulateWriteControls = false;

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataEventEmitter({
    invertersConnections,
    metersConnections,
});

sunSpecDataEventEmitter.on(
    'data',
    ({ invertersData, telemetry, currentAveragePowerRatio }) => {
        const dynamicExportConfig = calculateDynamicExportConfig({
            activeDerControlBase: simulatedActiveDerControlBase,
            telemetry,
            currentAveragePowerRatio,
        });

        logger.info(dynamicExportConfig, 'dynamicExportConfig');

        const inverterControls = invertersData.map(({ controls }) =>
            generateControlsModelWriteFromDynamicExportConfig({
                config: dynamicExportConfig,
                controlsModel: controls,
            }),
        );

        logger.info(
            inverterControls.map((controls) => ({
                Conn: controls.Conn,
                WMaxLimPct: controls.WMaxLimPct,
                WMaxLim_Ena: controls.WMaxLim_Ena,
                VArPct_Ena: controls.VArPct_Ena,
                OutPFSet_Ena: controls.OutPFSet_Ena,
            })),
            'inverterControls',
        );

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (simulateWriteControls) {
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

                logger.info(writeControlsModel, 'Writing controls model');

                await inverter.writeControlsModel(writeControlsModel);
            });
        }
    },
);
