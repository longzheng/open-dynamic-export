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
import { AmberSetpoint } from './index.js';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import sitePricesJson from '../../../../tests/amber/mocks/sitePrices.json' assert { type: 'json' };

describe('AmberSetpoint', () => {
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

    let amberControlLimit: AmberSetpoint;

    beforeEach(() => {
        // only mock date https://github.com/vitest-dev/vitest/issues/7288
        vi.useFakeTimers({
            toFake: ['Date'],
        });

        amberControlLimit = new AmberSetpoint({
            apiKey: 'abc',
            siteId: '12345',
        });
    });

    afterEach(() => {
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
            source: 'negativeFeedIn',
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: 0,
            opModGenLimW: undefined,
            opModImpLimW: undefined,
            opModLoadLimW: undefined,
        } satisfies typeof result);
    });

    it('should return no control limit when feed-in earns money', async () => {
        vi.setSystemTime(new Date('2024-09-04T10:00:01Z'));

        // give the polling a chance to finish
        await vi.advanceTimersToNextTimerAsync();

        const result = amberControlLimit.getInverterControlLimit();

        expect(result).toEqual({
            source: 'negativeFeedIn',
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: undefined,
            opModGenLimW: undefined,
            opModImpLimW: undefined,
            opModLoadLimW: undefined,
        } satisfies typeof result);
    });
});
