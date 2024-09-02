import 'dotenv/config';
import { getConfig } from '../helpers/config';
import { getSunSpecConnections } from '../sunspec/connections';
import { SunSpecDataHelper } from './helpers/sunspecData';
import { logger as pinoLogger } from '../helpers/logger';
import { InverterController } from './helpers/inverterController';
import { RampRateHelper } from './helpers/rampRate';
import { influxDbWriteApi } from '../helpers/influxdb';
import { Point } from '@influxdata/influxdb-client';
import { getSep2Instance } from '../sep2';

const logger = pinoLogger.child({ module: 'coordinator' });

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataHelper({
    invertersConnections,
    metersConnections,
});

const rampRateHelper = new RampRateHelper();

const sep2 = getSep2Instance({
    config,
    invertersConnections,
    rampRateHelper,
});

const inverterController = new InverterController({
    invertersConnections,
    applyControl: config.sunSpec.control,
    rampRateHelper,
    controlLimits: [sep2?.controlsScheduler].filter(
        (controlLimit) => !!controlLimit,
    ),
});

sunSpecDataEventEmitter.on('data', ({ invertersData, monitoringSample }) => {
    logger.trace({ invertersData, monitoringSample }, 'Received SunSpec data');

    influxDbWriteApi.writePoints(
        [
            new Point('monitoringSample')
                .tag('type', 'der')
                .floatField('reactivePower', monitoringSample.der.reactivePower)
                .floatField('frequency', monitoringSample.der.frequency),
            new Point('monitoringSample')
                .tag('type', 'der')
                .tag('phase', 'A')
                .floatField('realPower', monitoringSample.der.realPower.phaseA)
                .floatField('voltage', monitoringSample.der.voltage.phaseA),
            monitoringSample.der.realPower.phaseB
                ? new Point('monitoringSample')
                      .tag('type', 'der')
                      .tag('phase', 'B')
                      .floatField(
                          'realPower',
                          monitoringSample.der.realPower.phaseB,
                      )
                      .floatField(
                          'voltage',
                          monitoringSample.der.voltage.phaseB,
                      )
                : null,
            monitoringSample.der.realPower.phaseB
                ? new Point('monitoringSample')
                      .tag('type', 'der')
                      .tag('phase', 'C')
                      .floatField(
                          'realPower',
                          monitoringSample.der.realPower.phaseC,
                      )
                      .floatField(
                          'voltage',
                          monitoringSample.der.voltage.phaseC,
                      )
                : null,
        ].filter((point) => point !== null),
    );

    sep2?.derHelper.onInverterData(invertersData);
    sep2?.mirrorUsagePointListHelper.addSample(monitoringSample);

    inverterController.updateSunSpecInverterData({
        inverters: invertersData,
        monitoringSample,
    });
});
