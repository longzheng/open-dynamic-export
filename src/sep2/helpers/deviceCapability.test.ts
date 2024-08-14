import {
    describe,
    it,
    expect,
    vi,
    beforeAll,
    afterEach,
    beforeEach,
} from 'vitest';
import { SEP2Client } from '../client';
import { mockCert, mockKey } from '../../../tests/sep2/cert';
import { DeviceCapabilityHelper } from './deviceCapability';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getMockFile } from './mocks';

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
        .onGet('http://example.com/dcap')
        .reply(200, getMockFile('getDcap.xml'));
});

describe('DeviceCapabilityHelper', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should emit data event with response', async () => {
        const eventSpy = vi.fn();

        new DeviceCapabilityHelper({
            client: sep2Client,
            href: '/dcap',
            defaultPollRateSeconds: 30,
        }).on('data', eventSpy);

        await vi.waitFor(() => expect(eventSpy).toHaveBeenCalled());

        expect(eventSpy).toHaveBeenCalledOnce();
    });

    it('should poll and emit data event with response', async () => {
        const eventSpy = vi.fn();

        new DeviceCapabilityHelper({
            client: sep2Client,
            href: '/dcap',
            defaultPollRateSeconds: 30,
        }).on('data', eventSpy);

        // wait after two polls
        await vi.advanceTimersByTimeAsync(60_000);

        // called once on init, then twice after polling
        expect(eventSpy).toHaveBeenCalledTimes(3);
    });
});
