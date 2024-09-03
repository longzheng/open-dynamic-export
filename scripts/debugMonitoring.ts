import 'dotenv/config';
import { getConfig } from '../src/helpers/config';
import {
    getSunSpecInvertersConnections,
    getSunSpecMetersConnections,
} from '../src/sunspec/connections';
import { logger } from '../src/helpers/logger';
import { generateDerMonitoringSample } from '../src/coordinator/helpers/derMonitoring';
import { generateSiteMonitoringSample } from '../src/coordinator/helpers/siteMonitoring';

// This debugging script continously outputs SEP2 monitoring samples
// It reads SunSpec data, transforms it into monitoring sample, and logs to console
// It polls the inverters and smart meters every 100ms (after the previous poll)

const config = getConfig();

const invertersConnections = getSunSpecInvertersConnections(config);

const metersConnections = getSunSpecMetersConnections(config);

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

        const derMonitoringSample = generateDerMonitoringSample({
            inverters: invertersData,
        });

        const siteMonitoringSample = generateSiteMonitoringSample({
            meters: metersData,
        });

        logger.info(
            { derMonitoringSample, siteMonitoringSample },
            'calculated monitoring sample',
        );
    } catch (error) {
        logger.error({ error }, 'Failed to get monitoring sample');
    } finally {
        void poll();
    }
}

void poll();
