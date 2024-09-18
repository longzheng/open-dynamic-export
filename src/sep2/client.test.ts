import { SEP2Client } from './client.js';
import { beforeAll, it, expect, describe } from 'vitest';
import { RoleFlagsType } from './models/roleFlagsType.js';
import { mockCert, mockKey } from '../../tests/sep2/cert.js';

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

describe('generateMeterReadingMrid', () => {
    it('should generate meter reading MRID with PEN', () => {
        const result = sep2Client.generateMeterReadingMrid({
            roleFlags:
                RoleFlagsType.isMirror |
                RoleFlagsType.isDER |
                RoleFlagsType.isSubmeter,
            description: 'Average Real Power (W)',
        });

        expect(result).toContain('00012345');
    });

    it('should generate meter reading MRID based on roleFlags', () => {
        const result = sep2Client.generateMeterReadingMrid({
            roleFlags:
                RoleFlagsType.isMirror |
                RoleFlagsType.isDER |
                RoleFlagsType.isSubmeter,
            description: 'Average Real Power (W)',
        });
        const result2 = sep2Client.generateMeterReadingMrid({
            roleFlags:
                RoleFlagsType.isMirror |
                RoleFlagsType.isPremisesAggregationPoint,
            description: 'Average Real Power (W)',
        });

        expect(result).toBe('FC5ACDBAD6E6F0362CC0C14900012345');
        expect(result).not.toBe(result2);
    });

    it('should generate meter reading MRID based on description hash', () => {
        const result = sep2Client.generateMeterReadingMrid({
            roleFlags:
                RoleFlagsType.isMirror |
                RoleFlagsType.isPremisesAggregationPoint,
            description: 'Average Real Power (W)',
        });
        const result2 = sep2Client.generateMeterReadingMrid({
            roleFlags:
                RoleFlagsType.isMirror |
                RoleFlagsType.isPremisesAggregationPoint,
            description: 'Minimum Real Power (W)',
        });

        expect(result).toBe('FC5ACDBAD6E6F0362CC0C10300012345');
        expect(result).not.toBe(result2);
    });
});
