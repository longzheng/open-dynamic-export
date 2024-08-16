import 'dotenv/config';
import { getConfig } from '../src/config';
import { generateMonitoringSample } from '../src/coordinator/monitoring';
import { getSunSpecConnections } from '../src/sunspec/connections';
import { logger } from '../src/logger';

// This debugging script continously outputs SEP2 monitoring samples
// It reads SunSpec data, transforms it into monitoring sample, and logs to console
// It polls the inverters and smart meters every 100ms (after the previous poll)

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

async function poll() {
    try {
        const invertersData = await Promise.all(
            invertersConnections.map(async (inverter) => {
                return await inverter.getInverterModel();
            }),
        );

        const metersData = await Promise.all(
            metersConnections.map(async (meter) => {
                return await meter.getMeterModel();
            }),
        );

        const monitoringSample = generateMonitoringSample({
            inverters: invertersData,
            meters: metersData,
        });

        logger.info(monitoringSample, 'monitoring sample');
    } catch (error) {
        logger.error(error, 'Failed to get monitoring sample');
    } finally {
        setTimeout(() => {
            void poll();
        }, 100);
    }
}

void poll();
