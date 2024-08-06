import 'dotenv/config';
import { getConfig } from '../src/config';
import { getSunSpecConnections } from '../src/sunspec/connections';
import { calculateDynamicExportConfig } from '../src/coordinator.ts/dynamicExport';
import { getSunSpecTelemetry } from '../src/coordinator.ts/telemetry/sunspec';
import { getAveragePowerRatio } from '../src/sunspec/helpers/controls';
import type { DERControlBase } from '../src/sep2/models/derControlBase';

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

async function poll() {
    try {
        // get necessary inverter data
        const invertersData = await Promise.all(
            invertersConnections.map(async (inverter) => {
                return {
                    inverter: await inverter.getInverterModel(),
                    controls: await inverter.getControlsModel(),
                };
            }),
        );

        // get necessary meter data
        const metersData = await Promise.all(
            metersConnections.map(async (meter) => {
                return {
                    meter: await meter.getMeterModel(),
                };
            }),
        );

        // calculate telemetry data
        const telemetry = getSunSpecTelemetry({
            inverters: invertersData.map(({ inverter }) => inverter),
            meters: metersData.map(({ meter }) => meter),
        });

        const currentPowerRatio = getAveragePowerRatio(
            invertersData.map(({ controls }) => controls),
        );

        const dynamicExportConfig = calculateDynamicExportConfig({
            activeDerControlBase: simulatedActiveDerControlBase,
            telemetry,
            currentPowerRatio,
        });

        console.log(JSON.stringify(dynamicExportConfig, null, 2));
    } catch (error) {
        console.log('Failed to calculate dynamic export', error);
    } finally {
        setTimeout(() => {
            void poll();
        }, 100);
    }
}

void poll();
