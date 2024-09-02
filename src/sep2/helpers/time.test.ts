import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SEP2Client } from '../client';
import { mockCert, mockKey } from '../../../tests/sep2/cert';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getMockFile } from './mocks';
import { TimeHelper } from './time';

const mockAxios = new MockAdapter(axios)
    .onGet('http://example.com/api/v2/tm')
    .reply(200, getMockFile('getTm.xml'));

const sep2Client = new SEP2Client({
    sep2Config: {
        host: 'http://example.com',
        dcapUri: '/dcap',
    },
    cert: mockCert,
    key: mockKey,
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

        expect(mockAxios.history['get']?.length).toBe(1);
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
        expect(mockAxios.history['get']?.length).toBe(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledOnce();
    });

    it('should not change pollable resource if initialised again with same URL', async () => {
        const time = new TimeHelper({ client: sep2Client });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const destroySpy = vi.spyOn(time, 'destroy' as any);

        time.updateHref({
            href: '/api/v2/tm',
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(mockAxios.history['get']?.length).toBe(1);
        expect(destroySpy).toHaveBeenCalledOnce();
        expect(assertTimeSpy).toHaveBeenCalledOnce();

        time.updateHref({
            href: '/api/v2/tm',
        });

        expect(mockAxios.history['get']?.length).toBe(1);
        expect(destroySpy).toHaveBeenCalledOnce();
        expect(assertTimeSpy).toHaveBeenCalledOnce();
    });

    it('should change pollable resource if initialised again with different URL', async () => {
        mockAxios
            .onGet('http://example.com/api/v2/tm2')
            .reply(200, getMockFile('getTm.xml'));

        const time = new TimeHelper({ client: sep2Client });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assertTimeSpy = vi.spyOn(time, 'assertTime' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const destroySpy = vi.spyOn(time, 'destroy' as any);

        time.updateHref({
            href: '/api/v2/tm',
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(assertTimeSpy).toHaveBeenCalled());
        expect(mockAxios.history['get']?.length).toBe(1);
        expect(destroySpy).toHaveBeenCalledTimes(1);
        expect(assertTimeSpy).toHaveBeenCalledOnce();

        time.updateHref({
            href: '/api/v2/tm2',
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
