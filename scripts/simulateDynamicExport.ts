import 'dotenv/config';
import { getConfig } from '../src/config';
import { getSunSpecConnections } from '../src/sunspec/connections';
import { calculateDynamicExportValues } from '../src/coordinator.ts/dynamicExport';

// This debugging script simulates dynamic export control (without actually sending commands to inverters)
// It polls SunSpec data and telemetry
// It logs the the calculated target solar watts and power ratio to the console

const simulatedExportLimitWatts = 10000;

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

async function poll() {
    try {
        const {
            siteWatts,
            solarWatts,
            targetSolarWatts,
            currentPowerRatio,
            targetSolarPowerRatio,
        } = await calculateDynamicExportValues({
            exportLimitWatts: simulatedExportLimitWatts,
            invertersConnections,
            metersConnections,
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
            void poll();
        }, 100);
    }
}

void poll();
