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
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import sitePricesJson from '../../../../tests/amber/mocks/sitePrices.json' with { type: 'json' };
import { AmberSetpoint } from './index.js';

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

    it('should hold previous-interval state across the 1s boundary gap', async () => {
        // Amber returns adjacent intervals as e.g. HH:MM:01 → HH:MM:00,
        // leaving a 1-second gap at every boundary where strict half-open
        // matching would return no current interval. Each cached interval's
        // `end` is extended by 1s so the previous interval covers the boundary
        // second; verify at 500ms into a gap where the previous interval is
        // positive-priced (curtail), so the post-fix behaviour is distinct
        // from the pre-fix "no current interval → no curtail" branch.
        //
        // Mock fixture has adjacent feedIn intervals at this boundary:
        //   2024-09-04T04:00:01Z → 04:30:00Z  perKwh = +2.09587 (curtail)
        //   2024-09-04T04:30:01Z → 05:00:00Z  perKwh = −0.59540 (no curtail)
        vi.setSystemTime(new Date('2024-09-04T04:30:00.500Z'));

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
});
