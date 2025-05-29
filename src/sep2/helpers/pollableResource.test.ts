import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { type PollRate } from '../models/pollRate.js';
import { PollableResource } from './pollableResource.js';
import { SEP2Client } from '../client.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';

type MockResponse = {
    hello: string;
    pollRate: PollRate;
};

const sep2Client = new SEP2Client({
    host: 'http://example.com',
    cert: mockCert,
    cacert: mockCert,
    key: mockKey,
    pen: '12345',
});

describe('PollableResource', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should emit data event with response', async () => {
        const mockResponse: MockResponse = {
            hello: 'world',
            pollRate: 10,
        };

        class MockPollableResource extends PollableResource<MockResponse> {
            // eslint-disable-next-line @typescript-eslint/require-await
            async get(): Promise<MockResponse> {
                return mockResponse;
            }
        }

        const pollableResource = new MockPollableResource({
            client: sep2Client,
            url: 'http://example.com',
            defaultPollRateSeconds: 5,
        });

        const dataHandler = vi.fn();
        pollableResource.on('data', dataHandler);

        // Initial poll
        await vi.advanceTimersByTimeAsync(0);
        expect(dataHandler).toHaveBeenCalledTimes(1);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);

        // Subsequent poll after 10 seconds
        await vi.advanceTimersByTimeAsync(10 * 1000);
        expect(dataHandler).toHaveBeenCalledTimes(2);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);
    });

    it('should fallback to default poll rate if response does not contain poll rate', async () => {
        const mockResponse: MockResponse = {
            hello: 'world',
            pollRate: null,
        };

        class MockPollableResource extends PollableResource<MockResponse> {
            // eslint-disable-next-line @typescript-eslint/require-await
            async get(): Promise<MockResponse> {
                return mockResponse;
            }
        }

        const pollableResource = new MockPollableResource({
            client: sep2Client,
            url: 'http://example.com',
            defaultPollRateSeconds: 5,
        });

        const dataHandler = vi.fn();
        pollableResource.on('data', dataHandler);

        // Initial poll
        await vi.advanceTimersByTimeAsync(0);
        expect(dataHandler).toHaveBeenCalledTimes(1);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);

        // Subsequent poll after 5 seconds
        await vi.advanceTimersByTimeAsync(5 * 1000);
        expect(dataHandler).toHaveBeenCalledTimes(2);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);
    });

    it('should adapt to changing poll rates', async () => {
        const mockResponse: MockResponse = {
            hello: 'world',
            pollRate: 10,
        };

        class MockPollableResource extends PollableResource<MockResponse> {
            // eslint-disable-next-line @typescript-eslint/require-await
            async get(): Promise<MockResponse> {
                return mockResponse;
            }
        }

        const pollableResource = new MockPollableResource({
            client: sep2Client,
            url: 'http://example.com',
            defaultPollRateSeconds: 5,
        });

        const dataHandler = vi.fn();
        pollableResource.on('data', dataHandler);

        // Initial poll
        await vi.advanceTimersByTimeAsync(0);
        expect(dataHandler).toHaveBeenCalledTimes(1);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);

        // Change the response to have a different poll rate
        // this will take effect on the next poll
        vi.spyOn(pollableResource, 'get').mockResolvedValue({
            hello: 'world',
            pollRate: 2,
        });

        // Subsequent poll after 10 seconds
        await vi.advanceTimersByTimeAsync(10 * 1000);
        expect(dataHandler).toHaveBeenCalledTimes(2);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);

        // Subsequent poll after 2 seconds
        await vi.advanceTimersByTimeAsync(2 * 1000);
        expect(dataHandler).toHaveBeenCalledTimes(3);
        expect(dataHandler).toHaveBeenCalledWith(mockResponse);
    });

    it('should cancel poll timer when destroy is called during a running poll', async () => {
        const mockResponse: MockResponse = {
            hello: 'world',
            pollRate: 10,
        };

        class MockPollableResource extends PollableResource<MockResponse> {
            async get(): Promise<MockResponse> {
                // delay to simulate a slow get
                await new Promise((resolve) => setTimeout(resolve, 10_000));

                return mockResponse;
            }
        }

        const pollableResource = new MockPollableResource({
            client: sep2Client,
            url: 'http://example.com',
            defaultPollRateSeconds: 5,
        });

        const dataHandler = vi.fn();
        pollableResource.on('data', dataHandler);

        // Immediately destroy while get is pending
        pollableResource.destroy();

        await vi.advanceTimersByTimeAsync(0);
        expect(dataHandler).toHaveBeenCalledTimes(0);

        // Advance time to ensure no further polls
        await vi.advanceTimersByTimeAsync(30_000);
        expect(dataHandler).toHaveBeenCalledTimes(0);
    });
});
