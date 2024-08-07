import 'dotenv/config';
import { getConfig } from '../src/config';
import { getSunSpecConnections } from '../src/sunspec/connections';
import {
    calculateDynamicExportConfig,
    generateControlsModelWriteFromDynamicExportConfig,
} from '../src/coordinator.ts/dynamicExport';
import type { DERControlBase } from '../src/sep2/models/derControlBase';
import { SunSpecDataEventEmitter } from '../src/coordinator.ts/sunspecDataEventEmitter';

// This debugging script simulates dynamic export control (without actually sending commands to inverters)
// It polls SunSpec data and telemetry
// It logs the the calculated target solar watts and power ratio to the console

const simulatedActiveDerControlBase: DERControlBase = {
    opModExpLimW: {
        value: 10000,
        multiplier: 0,
    },
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
    ({ invertersData, telemetry, currentAveragePowerRatio }) => {
        const dynamicExportConfig = calculateDynamicExportConfig({
            activeDerControlBase: simulatedActiveDerControlBase,
            telemetry,
            currentAveragePowerRatio,
        });

        console.log(JSON.stringify(dynamicExportConfig, null, 2));

        const inverterControls = invertersData.map(({ controls }) =>
            generateControlsModelWriteFromDynamicExportConfig({
                config: dynamicExportConfig,
                controlsModel: controls,
            }),
        );

        console.table(
            inverterControls.map((controls) => ({
                Conn: controls.Conn,
                WMaxLimPct: controls.WMaxLimPct,
                WMaxLim_Ena: controls.WMaxLim_Ena,
                VArPct_Ena: controls.VArPct_Ena,
                OutPFSet_Ena: controls.OutPFSet_Ena,
            })),
        );
    },
);
