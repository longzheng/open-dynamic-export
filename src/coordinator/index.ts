import 'dotenv/config';
import { getConfig } from '../helpers/config.js';
import { pinoLogger } from '../helpers/logger.js';
import { InverterController } from './helpers/inverterController.js';
import { RampRateHelper } from '../sep2/helpers/rampRate.js';
import {
    writeDerSamplePoints,
    writeSiteSamplePoints,
} from '../helpers/influxdb.js';
import { getSep2Instance } from '../sep2/index.js';
import { getSiteSamplePollerInstance } from './helpers/siteSample.js';
import { type SiteSamplePollerBase } from '../meters/siteSamplePollerBase.js';
import { InvertersPoller } from './helpers/inverterSample.js';
import { destroySetpoints, type Setpoints } from '../setpoints/index.js';
import { getSetpoints } from '../setpoints/index.js';

const logger = pinoLogger.child({ module: 'coordinator' });

export type Coordinator = {
    inverterController: InverterController;
    invertersPoller: InvertersPoller;
    siteSamplePoller: SiteSamplePollerBase;
    setpoints: Setpoints;
    destroy: () => void;
};

export function createCoordinator(): Coordinator {
    const config = getConfig();

    const invertersPoller = new InvertersPoller({ config });

    const siteSamplePoller = getSiteSamplePollerInstance({
        config,
        invertersPoller,
    });

    const rampRateHelper = new RampRateHelper();

    const sep2Instance = getSep2Instance({
        config,
        rampRateHelper,
    });

    const setpoints = getSetpoints({
        config,
        sep2Instance,
    });

    const inverterController = new InverterController({
        config,
        setpoints,
        onControl: (InverterController) =>
            invertersPoller.onControl(InverterController),
    });

    invertersPoller.on('data', (derSample) => {
        writeDerSamplePoints(derSample);

        rampRateHelper.onDerSample(derSample);

        sep2Instance?.derHelper.onDerSample(derSample);
        sep2Instance?.mirrorUsagePointListHelper.addDerSample(derSample);

        inverterController.updateDerSample(derSample);
    });

    siteSamplePoller.on('data', ({ siteSample }) => {
        writeSiteSamplePoints(siteSample);

        sep2Instance?.mirrorUsagePointListHelper.addSiteSample(siteSample);

        inverterController.updateSiteSample(siteSample);
    });

    return {
        inverterController,
        invertersPoller,
        siteSamplePoller,
        setpoints,
        destroy: () => {
            logger.info('Destroying coordinator');
            sep2Instance?.destroy();
            siteSamplePoller.destroy();
            invertersPoller.destroy();
            inverterController.destroy();
            destroySetpoints(setpoints);
        },
    };
}
