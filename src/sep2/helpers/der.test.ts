import { afterEach, describe, it, expect, vi } from 'vitest';
import type { DERCapability } from '../../sep2/models/derCapability.js';
import { DERControlType } from '../../sep2/models/derControlType.js';
import { DOEControlType } from '../../sep2/models/doeModesSupportedType.js';
import { DERType } from '../../sep2/models/derType.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';
import { ConnectStatusValue } from '../models/connectStatus.js';
import { OperationalModeStatusValue } from '../models/operationModeStatus.js';
import type { DER } from '../models/der.js';
import type { SEP2Client } from '../client.js';
import { DerHelper, getDerCapabilityResponse } from './der.js';
import { RampRateHelper } from './rampRate.js';

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('getDerCapabilityResponse', () => {
    it('should return the correct DERCapabilityResponse for valid DerSample', () => {
        const derSample: Pick<DerSample, 'nameplate'> = {
            nameplate: {
                type: DERTyp.PV,
                maxW: 5000,
                maxVA: 5000,
                maxVar: 5000,
            },
        };

        const result: DERCapability = getDerCapabilityResponse(derSample);

        expect(result).toEqual({
            modesSupported:
                DERControlType.opModEnergize | DERControlType.opModConnect,
            doeModesSupported:
                DOEControlType.opModExpLimW | DOEControlType.opModGenLimW,
            type: DERType.PhotovoltaicSystem,
            rtgMaxVA: {
                value: 5,
                multiplier: 3,
            },
            rtgMaxVar: {
                value: 5,
                multiplier: 3,
            },
            rtgMaxW: {
                value: 5,
                multiplier: 3,
            },
            rtgVNom: undefined,
        });
    });
});

describe('DerHelper', () => {
    it('should keep posting DERStatus at the DERList poll rate', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

        const put = vi.fn().mockResolvedValue({});
        const client = { put } as unknown as SEP2Client;
        const helper = new DerHelper({
            client,
            rampRateHelper: new RampRateHelper(),
        });

        const der: DER = {
            subscribable: false,
            derStatusLink: { href: '/der/status' },
        };

        helper.configureDer({ der, pollRate: 2 });
        helper.onDerSample({
            date: new Date(),
            realPower: { type: 'noPhase', net: 0 },
            reactivePower: { type: 'noPhase', net: 0 },
            voltage: null,
            frequency: null,
            nameplate: {
                type: DERType.PhotovoltaicSystem,
                maxW: 5000,
                maxVA: 5000,
                maxVar: 5000,
            },
            settings: {
                setMaxW: 5000,
                setMaxVA: 5000,
                setMaxVar: 5000,
            },
            status: {
                operationalModeStatus:
                    OperationalModeStatusValue.OperationalMode,
                genConnectStatus:
                    ConnectStatusValue.Connected | ConnectStatusValue.Available,
            },
            invertersCount: 1,
        });

        await vi.advanceTimersByTimeAsync(2_000);
        await vi.advanceTimersByTimeAsync(2_000);

        expect(put).toHaveBeenCalledTimes(3);
        expect(put).toHaveBeenCalledWith(
            '/der/status',
            expect.stringContaining('<DERStatus'),
        );

        helper.destroy();

        await vi.advanceTimersByTimeAsync(2_000);
        expect(put).toHaveBeenCalledTimes(3);
    });
});
