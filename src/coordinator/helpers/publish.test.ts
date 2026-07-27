import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Config } from '../../helpers/configSchema.js';
import type { CsipAusControlSchedules } from '../../setpoints/csipAus/index.js';
import type {
    ActiveInverterControlLimit,
    InverterControlLimit,
} from './inverterController.js';
import { Publish } from './publish.js';

const { connectMock, publishMock } = vi.hoisted(() => ({
    connectMock: vi.fn(),
    publishMock: vi.fn(),
}));

vi.mock('mqtt', () => ({
    default: {
        connect: connectMock,
    },
}));

describe('Publish', () => {
    beforeEach(() => {
        connectMock.mockReset();
        publishMock.mockReset();
        connectMock.mockReturnValue({
            publish: publishMock,
        });
    });

    it('publishes CSIP-AUS data to the default MQTT topic', () => {
        const publisher = new Publish({
            config: {
                publish: {
                    mqtt: {
                        host: 'mqtt://localhost',
                        topic: 'limits',
                    },
                },
            } satisfies Pick<Config, 'publish'>,
        });

        publisher.onCsipAus({
            limit: csipAusInverterControlLimit,
            setGradW,
            schedules: emptySchedules,
        });

        expect(publishMock).toHaveBeenCalledWith(
            'limits/csipAus',
            JSON.stringify({
                limit: csipAusInverterControlLimit,
                setGradW,
                schedules: emptySchedules,
            }),
        );
    });

    it('publishes CSIP-AUS data to the configured MQTT topic', () => {
        const publisher = new Publish({
            config: {
                publish: {
                    mqtt: {
                        host: 'mqtt://localhost',
                        topic: 'limits',
                        csipAus: 'csip',
                    },
                },
            } satisfies Pick<Config, 'publish'>,
        });

        publisher.onCsipAus({
            limit: csipAusInverterControlLimit,
            setGradW,
            schedules: emptySchedules,
        });

        expect(publishMock).toHaveBeenCalledWith(
            'csip',
            JSON.stringify({
                limit: csipAusInverterControlLimit,
                setGradW,
                schedules: emptySchedules,
            }),
        );
    });

    it('publishes unchanged CSIP-AUS data repeatedly', () => {
        const publisher = new Publish({
            config: {
                publish: {
                    mqtt: {
                        host: 'mqtt://localhost',
                        topic: 'limits',
                    },
                },
            } satisfies Pick<Config, 'publish'>,
        });

        publisher.onCsipAus({
            limit: csipAusInverterControlLimit,
            setGradW,
            schedules: emptySchedules,
        });
        publisher.onCsipAus({
            limit: csipAusInverterControlLimit,
            setGradW,
            schedules: emptySchedules,
        });

        expect(publishMock).toHaveBeenCalledTimes(2);
        expect(publishMock).toHaveBeenNthCalledWith(
            1,
            'limits/csipAus',
            JSON.stringify({
                limit: csipAusInverterControlLimit,
                setGradW,
                schedules: emptySchedules,
            }),
        );
        expect(publishMock).toHaveBeenNthCalledWith(
            2,
            'limits/csipAus',
            JSON.stringify({
                limit: csipAusInverterControlLimit,
                setGradW,
                schedules: emptySchedules,
            }),
        );
    });

    it('publishes unchanged active inverter control limits repeatedly', () => {
        const publisher = new Publish({
            config: {
                publish: {
                    mqtt: {
                        host: 'mqtt://localhost',
                        topic: 'limits',
                    },
                },
            } satisfies Pick<Config, 'publish'>,
        });

        publisher.onActiveInverterControlLimit({
            limit: activeInverterControlLimit,
        });
        publisher.onActiveInverterControlLimit({
            limit: { ...activeInverterControlLimit },
        });

        expect(publishMock).toHaveBeenCalledTimes(2);
        expect(publishMock).toHaveBeenNthCalledWith(
            1,
            'limits',
            JSON.stringify(activeInverterControlLimit),
        );
        expect(publishMock).toHaveBeenNthCalledWith(
            2,
            'limits',
            JSON.stringify(activeInverterControlLimit),
        );
    });
});

const emptySchedules = {
    opModExpLimW: [],
    opModGenLimW: [],
    opModImpLimW: [],
    opModLoadLimW: [],
    opModEnergize: [],
    opModConnect: [],
} satisfies CsipAusControlSchedules;

const setGradW = 28;

const csipAusInverterControlLimit = {
    source: 'csipAus',
    opModEnergize: true,
    opModConnect: true,
    opModGenLimW: 6000,
    opModExpLimW: 5000,
    opModImpLimW: undefined,
    opModLoadLimW: undefined,
} satisfies InverterControlLimit;

const activeInverterControlLimit = {
    opModEnergize: undefined,
    opModConnect: undefined,
    opModGenLimW: undefined,
    opModExpLimW: { source: 'fixed', value: 5000 },
    opModImpLimW: undefined,
    opModLoadLimW: undefined,
} satisfies ActiveInverterControlLimit;
