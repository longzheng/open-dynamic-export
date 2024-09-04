import 'dotenv/config';
import { getConfig } from '../src/helpers/config';
import {
    getSunSpecInvertersConnections,
    getSunSpecMeterConnection,
} from '../src/sunspec/connections';
import { logger } from '../src/helpers/logger';
import { generateDerMonitoringSample } from '../src/sunspec/sunspecInverterPoller';
import { generateSiteMonitoringSample } from '../src/sunspec/sunspecMeterPoller';

// This debugging script continously outputs SEP2 monitoring samples
// It reads SunSpec data, transforms it into monitoring sample, and logs to console
// It polls the inverters and smart meters every 100ms (after the previous poll)

const config = getConfig();

const invertersConnections = getSunSpecInvertersConnections(config);

const meterConnection = getSunSpecMeterConnection(config);

async function poll() {
    try {
        const invertersData = await Promise.all(
            invertersConnections.map(async (inverter) => {
                return await inverter.getInverterModel();
            }),
        );

        const derMonitoringSample = generateDerMonitoringSample({
            inverters: invertersData,
        });

        logger.info({ derMonitoringSample }, 'DER monitoring sample');

        const metersData = await meterConnection.getMeterModel();

        const siteMonitoringSample = generateSiteMonitoringSample({
            meter: metersData,
        });

        logger.info({ siteMonitoringSample }, 'site monitoring sample');
    } catch (error) {
        logger.error({ error }, 'Failed to get monitoring sample');
    } finally {
        void poll();
    }
}

void poll();
