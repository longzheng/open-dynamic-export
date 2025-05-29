import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
    afterAll,
    beforeAll,
} from 'vitest';
import { SEP2Client } from '../client.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';
import { getMockFile } from './mocks.js';
import { TimeHelper } from './time.js';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

describe('TimeHelper', () => {
    const sep2Client = new SEP2Client({
        host: 'http://example.com',
        cert: mockCert,
        cacert: mockCert,
        key: mockKey,
        pen: '12345',
    });

    let timeHandlerCount = 0;
    let timeHandler2Count = 0;

    const mockRestHandlers = [
        http.get('http://example.com/api/v2/tm', () => {
            timeHandlerCount++;

            return HttpResponse.xml(getMockFile('getTm.xml'));
        }),
        http.get('http://example.com/api/v2/tm2', () => {
            timeHandler2Count++;

            return HttpResponse.xml(getMockFile('getTm.xml'));
        }),
    ];

    const mockServer = setupServer(...mockRestHandlers);

    // Start server before all tests
    beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

    //  Close server after all tests
    afterAll(() => mockServer.close());

    beforeEach(() => {
        timeHandlerCount = 0;
        timeHandler2Count = 0;

        // only mock date https://github.com/vitest-dev/vitest/issues/7288
        vi.useFakeTimers({ toFake: ['Date'] });
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should not should if clock is in sync', async () => {
        const time = new TimeHelper({ client: sep2Client });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.updateHref({
            href: '/api/v2/tm',
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());

        expect(timeHandlerCount).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();
    });

    it('should throw error if clock is not in sync', async () => {
        const fn = vi.fn();

        process.once('unhandledRejection', fn);

        const time = new TimeHelper({ client: sep2Client });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.updateHref({
            href: '/api/v2/tm',
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1582475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(timeHandlerCount).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledOnce();
    });

    it('should not change pollable resource if initialised again with same URL', async () => {
        const time = new TimeHelper({ client: sep2Client });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.updateHref({
            href: '/api/v2/tm',
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(timeHandlerCount).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();

        time.updateHref({
            href: '/api/v2/tm',
        });

        expect(timeHandlerCount).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();
    });

    it('should change pollable resource if initialised again with different URL', async () => {
        const time = new TimeHelper({ client: sep2Client });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.updateHref({
            href: '/api/v2/tm',
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(timeHandlerCount).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();

        time.updateHref({
            href: '/api/v2/tm2',
        });

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalledTimes(2));
        expect(timeHandlerCount).toBe(1);
        expect(timeHandler2Count).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledTimes(2);
    });
});
