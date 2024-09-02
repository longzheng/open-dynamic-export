import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { defaultPollPushRates, SEP2Client } from '../client';
import { mockCert, mockKey } from '../../../tests/sep2/cert';
import { DeviceCapabilityHelper } from './deviceCapability';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getMockFile } from './mocks';

new MockAdapter(axios)
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
