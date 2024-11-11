import { describe, it, expect } from 'vitest';
import { type DERCapability } from '../../sep2/models/derCapability.js';
import { DERControlType } from '../../sep2/models/derControlType.js';
import { DOEControlType } from '../../sep2/models/doeModesSupportedType.js';
import { getDerCapabilityResponse } from './der.js';
import { DERType } from '../../sep2/models/derType.js';
import { type DerSample } from '../../coordinator/helpers/derSample.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';

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
