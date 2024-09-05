import 'dotenv/config';
import { getConfig } from '../src/helpers/config';
import { getSunSpecInvertersConnections } from '../src/sunspec/connections';
import { logger } from '../src/helpers/logger';
import { SunSpecInverterPoller } from '../src/sunspec/sunspecInverterPoller';
import { getSiteMonitoringPollerInstance } from '../src/coordinator/helpers/siteMonitoring';

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
