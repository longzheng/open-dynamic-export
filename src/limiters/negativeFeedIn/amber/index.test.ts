import {
    afterEach,
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { AmberLimiter } from './index.js';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import sitePricesJson from '../../../../tests/amber/mocks/sitePrices.json';

describe('AmberLimiter', () => {
    const mockRestHandlers = [
        http.get('https://api.amber.com.au/v1/sites/*/prices/current', () => {
            return HttpResponse.json(sitePricesJson);
        }),
    ];

    const mockServer = setupServer(...mockRestHandlers);

    // Start server before all tests
    beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

    //  Close server after all tests
    afterAll(() => mockServer.close());

    let amberControlLimit: AmberLimiter;

    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();

        amberControlLimit = new AmberLimiter({
            apiKey: 'abc',
            siteId: '12345',
        });
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();

        // Reset handlers after each test `important for test isolation`
        mockServer.resetHandlers();
    });

    it('should return correct control limit when feed-in costs money', async () => {
        vi.setSystemTime(new Date('2024-09-04T01:00:01Z'));

        // give the polling a chance to finish
        await vi.advanceTimersToNextTimerAsync();

        const result = amberControlLimit.getInverterControlLimit();

        expect(result).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: 0,
            opModGenLimW: undefined,
        });
    });

    it('should return no control limit when feed-in earns money', async () => {
        vi.setSystemTime(new Date('2024-09-04T10:00:01Z'));

        // give the polling a chance to finish
        await vi.advanceTimersToNextTimerAsync();

        const result = amberControlLimit.getInverterControlLimit();

        expect(result).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: undefined,
            opModGenLimW: undefined,
        });
    });
});
