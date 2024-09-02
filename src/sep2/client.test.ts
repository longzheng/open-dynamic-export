import { SEP2Client } from './client';
import { beforeAll, it, expect, describe } from 'vitest';
import { RoleFlagsType } from './models/roleFlagsType';
import { mockCert, mockKey } from '../../tests/sep2/cert';

let sep2Client: SEP2Client;

beforeAll(() => {
    sep2Client = new SEP2Client({
        sep2Config: {
            host: 'http://example.com',
            dcapUri: '/dcap',
        },
        cert: mockCert,
        key: mockKey,
        pen: '12345',
    });
});

describe('generateUsagePointMrid', () => {
    it('should generate usage point MRID for site', () => {
        const result = sep2Client.generateUsagePointMrid(
            RoleFlagsType.isMirror | RoleFlagsType.isPremisesAggregationPoint,
        );

        expect(result).toBe('B9A8A75E324D2312AD09F80300012345');
    });

    it('should generate usage point MRID for DER', () => {
        const result = sep2Client.generateUsagePointMrid(
            RoleFlagsType.isMirror |
                RoleFlagsType.isDER |
                RoleFlagsType.isSubmeter,
        );

        expect(result).toBe('B9A8A75E324D2312AD09F84900012345');
    });
});

it('should generate meter reading MRID', () => {
    const result = sep2Client.generateMeterReadingMrid();
    const result2 = sep2Client.generateMeterReadingMrid();

    expect(result).toContain('00012345');
    expect(result).not.toBe(result2);
});
