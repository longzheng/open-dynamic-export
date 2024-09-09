import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { defaultPollPushRates, SEP2Client } from '../client.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';
import { DeviceCapabilityHelper } from './deviceCapability.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import type { AxiosInstance } from 'axios' with { 'resolution-mode': 'require' };
import { getMockFile } from './mocks.js';

new MockAdapter(axios as AxiosInstance)
    .onGet('http://example.com/dcap')
    .reply(200, getMockFile('getDcap.xml'));

const sep2Client = new SEP2Client({
    sep2Config: {
        host: 'http://example.com',
        dcapUri: '/dcap',
    },
    cert: mockCert,
    key: mockKey,
    pen: '12345',
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
        }).on('data', eventSpy);

        await vi.waitFor(() => expect(eventSpy).toHaveBeenCalled());

        expect(eventSpy).toHaveBeenCalledOnce();
    });

    it('should poll and emit data event with response', async () => {
        const eventSpy = vi.fn();

        new DeviceCapabilityHelper({
            client: sep2Client,
            href: '/dcap',
        }).on('data', eventSpy);

        // wait after two polls
        await vi.advanceTimersByTimeAsync(
            defaultPollPushRates.deviceCapabilityPoll * 1000 * 2,
        );

        // called once on init, then twice after polling
        expect(eventSpy).toHaveBeenCalledTimes(3);
    });
});
