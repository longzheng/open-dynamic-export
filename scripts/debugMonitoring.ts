import 'dotenv/config';
import { getConfig } from '../src/helpers/config.js';
import { getSunSpecInvertersConnections } from '../src/sunspec/connections.js';
import { logger } from '../src/helpers/logger.js';
import { SunSpecInverterPoller } from '../src/sunspec/sunspecInverterPoller.js';
import { getSiteMonitoringPollerInstance } from '../src/coordinator/helpers/siteMonitoring.js';

// This debugging script continously outputs DER and site monitoring samples

const config = getConfig();

const invertersConnections = getSunSpecInvertersConnections(config);

const siteMonitoringPoller = getSiteMonitoringPollerInstance(config);

const sunSpecInverterPoller = new SunSpecInverterPoller({
    invertersConnections,
});

sunSpecInverterPoller.on('data', ({ derMonitoringSample }) => {
    logger.info({ derMonitoringSample }, 'DER monitoring sample');
});

siteMonitoringPoller.on('data', ({ siteMonitoringSample }) => {
    logger.info({ siteMonitoringSample }, 'site monitoring sample');
});
