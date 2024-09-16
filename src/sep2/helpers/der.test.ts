import { describe, it, expect } from 'vitest';
import { DERTyp } from '../../sunspec/models/nameplate.js';
import type { DERCapability } from '../../sep2/models/derCapability.js';
import { DERControlType } from '../../sep2/models/derControlType.js';
import { DOEModesSupportedType } from '../../sep2/models/doeModesSupportedType.js';
import { getDerCapabilityResponseFromInverterData } from './der.js';
import { DERType } from '../../sep2/models/derType.js';
import type { InverterData } from '../../coordinator/helpers/inverterData.js';

describe('getDerCapabilityResponseFromInverterData', () => {
    it('should return the correct DERCapabilityResponse for valid nameplateModels', () => {
        const data: Pick<InverterData, 'nameplate'>[] = [
            {
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 5000,
                },
            },
        ];

        const result: DERCapability =
            getDerCapabilityResponseFromInverterData(data);

        expect(result).toEqual({
            modesSupported:
                DERControlType.opModEnergize | DERControlType.opModConnect,
            doeModesSupported:
                DOEModesSupportedType.opModExpLimW |
                DOEModesSupportedType.opModGenLimW,
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

    it('should return the correct DERCapabilityResponse for multiple valid nameplateModels', () => {
        const data: Pick<InverterData, 'nameplate'>[] = [
            {
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 5000,
                },
            },
            {
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 5000,
                },
            },
        ];

        const result: DERCapability =
            getDerCapabilityResponseFromInverterData(data);

        expect(result).toEqual({
            modesSupported:
                DERControlType.opModEnergize | DERControlType.opModConnect,
            doeModesSupported:
                DOEModesSupportedType.opModExpLimW |
                DOEModesSupportedType.opModGenLimW,
            type: DERType.PhotovoltaicSystem,
            rtgMaxVA: {
                value: 1,
                multiplier: 4,
            },
            rtgMaxVar: {
                value: 1,
                multiplier: 4,
            },
            rtgMaxW: {
                value: 1,
                multiplier: 4,
            },
            rtgVNom: undefined,
        });
    });
});
