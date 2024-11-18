import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { Powerwall2Client } from './client.js';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import loginBasicJson from '../../../tests/tesla/powerwall2/mocks/loginBasic.json';
import metersAggregatesJson from '../../../tests/tesla/powerwall2/mocks/metersAggregates.json';
import metersSiteSinglePhaseJson from '../../../tests/tesla/powerwall2/mocks/metersSiteSinglePhase.json';
import metersSiteThreePhaseJson from '../../../tests/tesla/powerwall2/mocks/metersSiteThreePhase.json';
import systemStatusJson from '../../../tests/tesla/powerwall2/mocks/systemStatus.json';

describe('Powerwall2Client', () => {
    const mockIp = '192.168.1.123';

    const mockRestHandlers = [
        http.post(`https://${mockIp}/api/login/Basic`, () => {
            return HttpResponse.json(loginBasicJson);
        }),

        http.get(`https://${mockIp}/api/meters/aggregates`, () => {
            return HttpResponse.json(metersAggregatesJson);
        }),

        http.get(`https://${mockIp}/api/system_status`, () => {
            return HttpResponse.json(systemStatusJson);
        }),

        http.get(`https://${mockIp}/api/system_status/soe`, () => {
            return HttpResponse.json({ percentage: 80.87499075192977 });
        }),

        http.get(`https://${mockIp}/api/meters/site`, () => {
            return HttpResponse.json(metersSiteThreePhaseJson);
        }),
    ];

    const mockServer = setupServer(...mockRestHandlers);

    // Start server before all tests
    beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

    let power2Client: Powerwall2Client;

    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();

        power2Client = new Powerwall2Client({
            ip: mockIp,
            password: 'testpassword',
            timeoutSeconds: 5,
        });
    });

    //  Close server after all tests
    afterAll(() => mockServer.close());

    it('can get meter aggregates', async () => {
        const result = await power2Client.getMeterAggregates();

        expect(result.site.frequency).toBe(50);
    });

    it('can get state of energy', async () => {
        const result = await power2Client.getSoe();

        expect(result.percentage).toBe(80.87499075192977);
    });

    it('can get meter site for three phase', async () => {
        const result = await power2Client.getMetersSite();

        expect(result[0]?.Cached_readings.reactive_power_a).toBe(-770);
        expect(result[0]?.Cached_readings.reactive_power_b).toBe(-440);
    });

    it('can get meter site for single phase', async () => {
        mockServer.use(
            http.get(`https://${mockIp}/api/meters/site`, () => {
                return HttpResponse.json(metersSiteSinglePhaseJson);
            }),
        );

        const result = await power2Client.getMetersSite();

        expect(result[0]?.Cached_readings.reactive_power_a).toBe(-600);
        expect(result[0]?.Cached_readings.reactive_power_b).toBe(undefined);
    });

    it('can get system status', async () => {
        const result = await power2Client.getSystemStatus();

        expect(result.battery_target_power).toBe(0);
        expect(result.max_discharge_power).toBe(15000);
    });
});
