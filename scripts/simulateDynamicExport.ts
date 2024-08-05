import 'dotenv/config';
import { getConfig } from '../src/config';
import { getBrandByCommonModel } from '../src/sunspec/brand';
import { getTelemetryFromSunSpec } from '../src/coordinator.ts/telemetry';
import { getSunSpecConnections } from '../src/sunspec/connections';
import {
    calculateTargetSolarPowerRatio,
    calculateTargetSolarWatts,
} from '../src/coordinator.ts/dynamicExport';
import { getAveragePowerRatio } from '../src/sunspec/helpers/controls';

// This debugging script simulates dynamic export control (without actually sending commands to inverters)
// It polls SunSpec data and telemetry
// It logs the the calculated target solar watts and power ratio to the console

const simulatedExportLimitWatts = 10000;

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

async function calculate() {
    try {
        const invertersData = await Promise.all(
            invertersConnections.map(async (inverter) => {
                const common = await inverter.getCommonModel();

                const brand = getBrandByCommonModel(common);

                return {
                    inverter: await inverter.getInverterModel(brand),
                    controls: await inverter.getControlsModel(brand),
                };
            }),
        );

        const metersData = await Promise.all(
            metersConnections.map(async (meter) => {
                const common = await meter.getCommonModel();

                const brand = getBrandByCommonModel(common);

                return await meter.getMeterModel(brand);
            }),
        );

        const telemetry = getTelemetryFromSunSpec({
            inverters: invertersData.map(({ inverter }) => inverter),
            meters: metersData,
        });

        const siteWatts = telemetry.realPower.site.total;
        const solarWatts = telemetry.realPower.der.total;

        const targetSolarWatts = calculateTargetSolarWatts({
            exportLimitWatts: simulatedExportLimitWatts,
            siteWatts,
            solarWatts,
        });

        const currentPowerRatio = getAveragePowerRatio(
            invertersData.map(({ controls }) => controls),
        );

        const targetSolarPowerRatio = calculateTargetSolarPowerRatio({
            currentPowerRatio,
            currentSolarWatts: solarWatts,
            targetSolarWatts,
        });

        console.table([
            {
                siteWatts,
                solarWatts,
                targetSolarWatts,
                currentPowerRatio,
                targetSolarPowerRatio,
            },
        ]);
    } catch (error) {
        console.log('Failed to calculate dynamic export', error);
    } finally {
        setTimeout(() => {
            void calculate();
        }, 100);
    }
}

void calculate();
