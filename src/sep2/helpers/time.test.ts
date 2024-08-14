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
    });

    it('should not should if clock is in sync', async () => {
        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = vi.spyOn(time, 'assertTime' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1682475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(spy).toHaveBeenCalled());

        expect(spy).toHaveBeenCalledOnce();
    });

    it('should throw error if clock is not in sync', async () => {
        const fn = vi.fn();

        process.on('unhandledRejection', fn);

        const time = new TimeHelper();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = vi.spyOn(time, 'assertTime' as any);

        time.init({
            client: sep2Client,
            href: '/api/v2/tm',
            defaultPollRateSeconds: 30,
        });

        // mock system date to match the time in the mock file
        const mockDate = new Date(1582475024000);
        vi.setSystemTime(mockDate);

        await vi.waitFor(() => expect(spy).toHaveBeenCalled());

        expect(spy).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledOnce();
    });
});
