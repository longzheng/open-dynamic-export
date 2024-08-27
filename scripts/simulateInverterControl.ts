import 'dotenv/config';
import { getConfig } from '../src/helpers/config';
import { getSunSpecConnections } from '../src/sunspec/connections';
import { SunSpecDataHelper } from '../src/coordinator/helpers/sunspecData';
import { logger } from '../src/helpers/logger';
import type { ActiveDERControlBaseValues } from '../src/coordinator/helpers/inverterController';
import {
    calculateInverterConfiguration,
    generateControlsModelWriteFromInverterConfiguration,
} from '../src/coordinator/helpers/inverterController';
import { RampRateHelper } from '../src/coordinator/helpers/rampRate';

// This debugging script simulates dynamic export control (without actually sending commands to inverters)
// It polls SunSpec data and telemetry
// It logs the the calculated target solar watts and power ratio to the console

const simulatedActiveDerControlBase: ActiveDERControlBaseValues = {
    opModExpLimW: {
        value: 10000,
        multiplier: 0,
    },
    opModGenLimW: undefined,
    opModConnect: true,
    opModEnergize: true,
};

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataHelper({
    invertersConnections,
    metersConnections,
});

const rampRateHelper = new RampRateHelper();

sunSpecDataEventEmitter.on('data', ({ invertersData, monitoringSample }) => {
    const inverterConfiguration = calculateInverterConfiguration({
        activeDerControlBaseValues: simulatedActiveDerControlBase,
        sunSpecData: {
            inverters: invertersData,
            monitoringSample,
        },
        rampRateHelper,
    });

    const inverterControls = invertersData.map(({ controls }) =>
        generateControlsModelWriteFromInverterConfiguration({
            inverterConfiguration,
            controlsModel: controls,
        }),
    );

    logger.info(
        {
            inverterConfiguration,
            inverterControls: inverterControls.map((controls) => ({
                Conn: controls.Conn,
                WMaxLimPct: controls.WMaxLimPct,
                WMaxLim_Ena: controls.WMaxLim_Ena,
                VArPct_Ena: controls.VArPct_Ena,
                OutPFSet_Ena: controls.OutPFSet_Ena,
            })),
        },
        'Calculated inverter config',
    );

    void invertersConnections.map(async (inverter, index) => {
        const inverterData = invertersData[index];

        if (!inverterData) {
            throw new Error('Inverter data not found');
        }

        const writeControlsModel =
            generateControlsModelWriteFromInverterConfiguration({
                inverterConfiguration,
                controlsModel: inverterData.controls,
            });

        if (!config.sunSpec.control) {
            logger.info(
                { model: writeControlsModel },
                'Writing controls model',
            );

            await inverter.writeControlsModel(writeControlsModel);
        }
    });
});
