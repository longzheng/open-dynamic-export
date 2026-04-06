import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCsipAusStatus } from './csipAusService.js';

const { getSetpointsMock } = vi.hoisted(() => ({
    getSetpointsMock: vi.fn(),
}));

vi.mock('./coordinatorService.js', () => ({
    coordinatorService: {
        getSetpoints: getSetpointsMock,
    },
}));

describe('getCsipAusStatus', () => {
    beforeEach(() => {
        getSetpointsMock.mockReset();
    });

    it('should return disconnected status when CSIP-AUS is not running', () => {
        getSetpointsMock.mockReturnValue({
            csipAus: null,
        });

        expect(getCsipAusStatus()).toEqual({
            connected: false,
            lfdi: null,
            sfdi: null,
        });
    });

    it('should return setpoint status when CSIP-AUS is running', () => {
        getSetpointsMock.mockReturnValue({
            csipAus: {
                getStatus: () => ({
                    connected: true,
                    lfdi: 'LFDI',
                    sfdi: 'SFDI',
                }),
            },
        });

        expect(getCsipAusStatus()).toEqual({
            connected: true,
            lfdi: 'LFDI',
            sfdi: 'SFDI',
        });
    });
});
