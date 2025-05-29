import { SEP2Client } from './client.js';
import {
    beforeAll,
    it,
    expect,
    describe,
    afterAll,
    vi,
    beforeEach,
    afterEach,
} from 'vitest';
import { RoleFlagsType } from './models/roleFlagsType.js';
import { mockCert, mockKey } from '../../tests/sep2/cert.js';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

let sep2Client: SEP2Client;

const server = setupServer();

beforeAll(() => {
    server.listen();

    sep2Client = new SEP2Client({
        host: 'http://example.com',
        cert: mockCert,
        cacert: mockCert,
        key: mockKey,
        pen: '12345',
    });
});

afterAll(() => {
    server.close();
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

describe('axios-retry', () => {
    let failThreeRequestCount = 0;

    beforeEach(() => {
        failThreeRequestCount = 0;

        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should retry on failure', async () => {
        server.use(
            http.get(
                'http://example.com/failonce',
                () => {
                    failThreeRequestCount++;

                    return HttpResponse.error();
                },
                {
                    once: true,
                },
            ),
            http.get('http://example.com/failonce', () => {
                failThreeRequestCount++;

                return HttpResponse.xml();
            }),
        );

        // don't run promise with await because we want to test the delay inside the promise
        let result;
        void sep2Client.get('/failonce').then((res) => (result = res));

        // no retry yet
        await vi.advanceTimersByTimeAsync(50);
        expect(failThreeRequestCount).toBe(1);

        // after one retry
        await vi.advanceTimersByTimeAsync(500);
        expect(failThreeRequestCount).toBe(2);

        expect(result).toEqual(null);
    });

    it('should use exponential delay', async () => {
        failThreeRequestCount = 0;

        server.use(
            http.get(
                'http://example.com/failthree',
                () => {
                    failThreeRequestCount++;

                    return HttpResponse.error();
                },
                {
                    once: true,
                },
            ),
            http.get(
                'http://example.com/failthree',
                () => {
                    failThreeRequestCount++;

                    return HttpResponse.error();
                },
                {
                    once: true,
                },
            ),
            http.get(
                'http://example.com/failthree',
                () => {
                    failThreeRequestCount++;

                    return HttpResponse.error();
                },
                {
                    once: true,
                },
            ),
            http.get('http://example.com/failthree', () => {
                failThreeRequestCount++;

                return HttpResponse.xml();
            }),
        );

        // don't run promise with await because we want to test the delay inside the promise
        let result;
        void sep2Client.get('/failthree').then((res) => (result = res));

        // no retry yet
        await vi.advanceTimersByTimeAsync(0);
        expect(failThreeRequestCount).toBe(1);

        // linear retry
        await vi.advanceTimersByTimeAsync(100);
        expect(failThreeRequestCount).toBe(1);

        // exponential
        await vi.advanceTimersByTimeAsync(300);
        expect(failThreeRequestCount).toBe(2);

        await vi.advanceTimersByTimeAsync(500);
        expect(failThreeRequestCount).toBe(3);

        await vi.advanceTimersByTimeAsync(1000);
        expect(failThreeRequestCount).toBe(4);

        expect(result).toEqual(null);
    });
});
