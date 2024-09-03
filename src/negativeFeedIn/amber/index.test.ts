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
import { AmberControlLimit, getControlLimitFromIntervals } from '.';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

describe('AmberControlLimit', () => {
    // sample data from https://community.openhab.org/t/supporting-spot-energy-pricing/157274
    const sitePricesResponse = [
        {
            type: 'ActualInterval',
            duration: 5,
            spotPerKwh: 6.12,
            perKwh: 24.33,
            date: '2021-05-05',
            nemTime: '2021-05-06T12:30:00+10:00',
            startTime: '2021-05-05T02:00:01Z',
            endTime: '2021-05-05T02:30:00Z',
            renewables: 45,
            channelType: 'general',
            tariffInformation: 'string',
            spikeStatus: 'none',
            descriptor: 'negative',
        },
        {
            type: 'CurrentInterval',
            duration: 5,
            spotPerKwh: 6.12,
            perKwh: 24.33,
            date: '2021-05-05',
            nemTime: '2021-05-06T12:30:00+10:00',
            startTime: '2021-05-05T02:00:01Z',
            endTime: '2021-05-05T02:30:00Z',
            renewables: 45,
            channelType: 'general',
            tariffInformation: 'string',
            spikeStatus: 'none',
            descriptor: 'negative',
            range: 'string',
            estimate: true,
            advancedPrice: 'string',
        },
        {
            type: 'ForecastInterval',
            duration: 5,
            spotPerKwh: -6.12,
            perKwh: -24.33,
            date: '2021-05-05',
            nemTime: '2021-05-06T13:00:00+10:00',
            startTime: '2021-05-05T02:30:01Z',
            endTime: '2021-05-05T03:00:00Z',
            renewables: 45,
            channelType: 'general',
            tariffInformation: 'string',
            spikeStatus: 'none',
            descriptor: 'negative',
            range: 'string',
            advancedPrice: 'string',
        },
    ];

    const mockRestHandlers = [
        http.get('https://api.amber.com.au/v1/sites/*/prices/current', () => {
            return HttpResponse.json(sitePricesResponse);
        }),
    ];

    const mockServer = setupServer(...mockRestHandlers);

    // Start server before all tests
    beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

    //  Close server after all tests
    afterAll(() => mockServer.close());

    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();

        // Reset handlers after each test `important for test isolation`
        mockServer.resetHandlers();
    });

    it('should return correct control limit when negative price', async () => {
        vi.setSystemTime(new Date('2021-05-05T02:30:01Z'));

        const amberControlLimit = new AmberControlLimit({ siteId: '12345' });

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

    it('should return no control limit when positive price', async () => {
        vi.setSystemTime(new Date('2021-05-05T02:00:01Z'));

        const amberControlLimit = new AmberControlLimit({ siteId: '12345' });

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

describe('getControlLimitFromIntervals', () => {
    it('should return correct control limit with active interval', () => {
        vi.setSystemTime(new Date('2024-01-01T00:00:01Z'));

        const feedInIntervals = [
            {
                start: new Date('2024-01-01T00:00:00Z'),
                end: new Date('2024-01-01T00:30:00Z'),
                price: -60.0,
            },
            {
                start: new Date('2024-01-01T00:30:00Z'),
                end: new Date('2024-01-01T01:00:00Z'),
                price: 30.0,
            },
        ];

        const result = getControlLimitFromIntervals(feedInIntervals);

        expect(result).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: 0,
            opModGenLimW: undefined,
        });
    });

    it('should return correct control limit when no applicable intervals', () => {
        // january
        vi.setSystemTime(new Date('2024-01-01T00:00:01Z'));

        // all future intervals
        const feedInIntervals = [
            {
                start: new Date('2024-02-01T00:00:00Z'),
                end: new Date('2024-02-01T00:30:00Z'),
                price: -60.0,
            },
            {
                start: new Date('2024-02-01T00:30:00Z'),
                end: new Date('2024-02-01T01:00:00Z'),
                price: 30.0,
            },
        ];

        const result = getControlLimitFromIntervals(feedInIntervals);

        expect(result).toEqual({
            opModConnect: undefined,
            opModEnergize: undefined,
            opModExpLimW: undefined,
            opModGenLimW: undefined,
        });
    });
});
