import {
    describe,
    it,
    expect,
    vi,
    beforeAll,
    beforeEach,
    afterEach,
} from 'vitest';
import { SEP2Client } from '../client';
import { mockCert, mockKey } from '../../../tests/sep2/cert';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getMockFile } from './mocks';
import { TimeHelper } from './time';

const mockAxios = new MockAdapter(axios);

const sep2Client = new SEP2Client({
    sep2Config: {
        host: 'http://example.com',
        dcapUri: '/dcap',
        pen: 12345,
    },
    cert: mockCert,
    key: mockKey,
});

beforeAll(() => {
    mockAxios
        .onGet('http://example.com/api/v2/tm')
        .reply(200, getMockFile('getTm.xml'));
});

describe('TimeHelper', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();

        mockAxios.resetHistory();
    });

    it('should not should if clock is in sync', async () => {
        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());

        expect(mockAxios.history['get']?.length).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();
    });

    it('should throw error if clock is not in sync', async () => {
        const fn = vi.fn();

        process.on('unhandledRejection', fn);

        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1582475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());

        expect(mockAxios.history['get']?.length).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledOnce();
    });

    it('should poll', async () => {
        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        // wait after two polls
        await vi.advanceTimersByTimeAsync(60_000);

        // called once on init, then twice after polling
        expect(mockAxios.history['get']?.length).toBe(3);
        expect(assertTimeSpy).toHaveBeenCalledTimes(3);
    });

    it('should not change pollable resource if initialised again with same URL', async () => {
        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const destroySpy = vi.spyOn(time, 'destroy' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(mockAxios.history['get']?.length).toBe(1);
        expect(destroySpy).toHaveBeenCalledOnce();
        expect(assertTimeSpy).toHaveBeenCalledOnce();

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        expect(mockAxios.history['get']?.length).toBe(1);
        expect(destroySpy).toHaveBeenCalledOnce();
        expect(assertTimeSpy).toHaveBeenCalledOnce();
    });

    it('should change pollable resource if initialised again with different URL', async () => {
        mockAxios
            .onGet('http://example.com/api/v2/tm2')
            .reply(200, getMockFile('getTm.xml'));

        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const destroySpy = vi.spyOn(time, 'destroy' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(mockAxios.history['get']?.length).toBe(1);
        expect(destroySpy).toHaveBeenCalledTimes(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();

        time.init({
            client: sep2Client,
            href: '/api/v2/tm2',
            defaultPollRateSeconds: 30,
        });

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalledTimes(2));
        expect(mockAxios.history['get']?.length).toBe(2);
        expect(mockAxios.history['get']?.at(1)?.url).toBe(
            'http://example.com/api/v2/tm2',
        );
        expect(destroySpy).toHaveBeenCalledTimes(2);
        expect(assertTimeSpy).toHaveBeenCalledTimes(2);
    });
});
