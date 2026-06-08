import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Config } from '../../helpers/configSchema.js';
import type { CsipAusControlSchedules } from '../../setpoints/csipAus/index.js';
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

    it('publishes CSIP-AUS control schedules to the default MQTT topic', () => {
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

        publisher.onCsipAusControlSchedules({
            schedules: emptySchedules,
        });

        expect(publishMock).toHaveBeenCalledWith(
            'limits/csipAus/schedules',
            JSON.stringify(emptySchedules),
        );
    });

    it('publishes CSIP-AUS control schedules to the configured MQTT topic', () => {
        const publisher = new Publish({
            config: {
                publish: {
                    mqtt: {
                        host: 'mqtt://localhost',
                        topic: 'limits',
                        csipAusControlSchedules: 'csip/schedules',
                    },
                },
            } satisfies Pick<Config, 'publish'>,
        });

        publisher.onCsipAusControlSchedules({
            schedules: emptySchedules,
        });

        expect(publishMock).toHaveBeenCalledWith(
            'csip/schedules',
            JSON.stringify(emptySchedules),
        );
    });

    it('does not publish unchanged CSIP-AUS control schedules repeatedly', () => {
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

        publisher.onCsipAusControlSchedules({
            schedules: emptySchedules,
        });
        publisher.onCsipAusControlSchedules({
            schedules: emptySchedules,
        });

        expect(publishMock).toHaveBeenCalledTimes(1);
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
