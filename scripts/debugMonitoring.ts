import 'dotenv/config';
import { getConfig } from '../src/helpers/config.js';
import { getSunSpecInvertersConnections } from '../src/sunspec/connections.js';
import { logger } from '../src/helpers/logger.js';
import { SunSpecInverterPoller } from '../src/sunspec/sunspecInverterPoller.js';
import { getSiteSamplePollerInstance } from '../src/coordinator/helpers/siteSample.js';

// This debugging script continously outputs DER and site samples

const config = getConfig();

const invertersConnections = getSunSpecInvertersConnections(config);

const siteSamplePoller = getSiteSamplePollerInstance(config);

const sunSpecInverterPoller = new SunSpecInverterPoller({
    invertersConnections,
});

sunSpecInverterPoller.on('data', ({ derSample }) => {
    logger.info({ derSample }, 'DER sample');
});

siteSamplePoller.on('data', ({ siteSample }) => {
    logger.info({ siteSample }, 'site sample');
});
