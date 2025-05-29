import {
    describe,
    it,
    expect,
    vi,
    afterEach,
    beforeEach,
    afterAll,
    beforeAll,
} from 'vitest';
import { defaultPollPushRates, SEP2Client } from '../client.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';
import { DeviceCapabilityHelper } from './deviceCapability.js';
import { http, HttpResponse } from 'msw';
import { getMockFile } from './mocks.js';
import { setupServer } from 'msw/node';

describe('DeviceCapabilityHelper', () => {
    const sep2Client = new SEP2Client({
        host: 'http://example.com',
        cert: mockCert,
        cacert: mockCert,
        key: mockKey,
        pen: '12345',
    });

    const mockRestHandlers = [
        http.get('http://example.com/dcap', () => {
            return HttpResponse.xml(getMockFile('getDcap.xml'));
        }),
    ];

    const mockServer = setupServer(...mockRestHandlers);

    // Start server before all tests
    beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

    //  Close server after all tests
    afterAll(() => mockServer.close());

    beforeEach(() => {
        // only mock setTimeout https://github.com/vitest-dev/vitest/issues/7288
        vi.useFakeTimers({
            toFake: ['setTimeout'],
        });
    });

    afterEach(() => {
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
