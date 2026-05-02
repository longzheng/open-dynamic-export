import { getConfig } from '../helpers/config.js';
import { pinoLogger } from '../helpers/logger.js';
import {
    writeDerSamplePoints,
    writeSiteSamplePoints,
} from '../helpers/influxdb.js';
import type { SiteSamplePollerBase } from '../meters/siteSamplePollerBase.js';
import {
    getSetpoints,
    destroySetpoints,
    type Setpoints,
} from '../setpoints/index.js';
import { InvertersPoller } from './helpers/inverterSample.js';
import { getSiteSamplePollerInstance } from './helpers/siteSample.js';
import { InverterController } from './helpers/inverterController.js';

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

    const setpoints = getSetpoints({
        config,
    });

    const inverterController = new InverterController({
        config,
        setpoints,
        onControl: (InverterController) =>
            invertersPoller.onControl(InverterController),
    });

    invertersPoller.on('data', (derSample) => {
        writeDerSamplePoints(derSample);

        setpoints.csipAus?.onDerSample(derSample);

        inverterController.updateDerSample(derSample);
    });

    siteSamplePoller.on('data', ({ siteSample }) => {
        writeSiteSamplePoints(siteSample);

        setpoints.csipAus?.onSiteSample(siteSample);

        inverterController.updateSiteSample(siteSample);
    });

    return {
        inverterController,
        invertersPoller,
        siteSamplePoller,
        setpoints,
        destroy: () => {
            logger.info('Destroying coordinator');
            siteSamplePoller.destroy();
            invertersPoller.destroy();
            inverterController.destroy();
            destroySetpoints(setpoints);
        },
    };
}
