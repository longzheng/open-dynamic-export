import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PollRate } from '../models/pollRate';
import { PollableResource } from './pollableResource';
import { SEP2Client } from '../client';
import { mockCert, mockKey } from '../../../tests/sep2/cert';

type MockResponse = {
    hello: string;
    pollRate: PollRate;
};

const sep2Client = new SEP2Client({
    sep2Config: {
        host: 'http://example.com',
        dcapUri: '/dcap',
        pen: 12345,
    },
    cert: mockCert,
    key: mockKey,
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

        vi.useRealTimers();
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

        vi.useRealTimers();
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

        vi.useRealTimers();
    });
});
