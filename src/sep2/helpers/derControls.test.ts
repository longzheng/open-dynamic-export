import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SEP2Client } from '../client.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';
import { type MergedControlsData } from './derControls.js';
import {
    DerControlsHelper,
    sortMergedControlsDataByStartTimeAscending,
} from './derControls.js';
import { generateMockDERControl } from '../../../tests/sep2/DERControl.js';
import { generateMockDERProgram } from '../../../tests/sep2/DERProgram.js';
import { generateMockFunctionSetAssignments } from '../../../tests/sep2/FunctionSetAssignments.js';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { CurrentStatus } from '../models/currentStatus.js';

const sep2Client = new SEP2Client({
    host: 'http://example.com',
    cert: mockCert,
    cacert: mockCert,
    key: mockKey,
    pen: '12345',
});

const mockRestHandlers = [
    http.post(`http://example.com/*`, () => {
        return HttpResponse.xml();
    }),
];

const mockServer = setupServer(...mockRestHandlers);

// Start server before all tests
beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => mockServer.close());

describe('DerControlsHelper', () => {
    it('should respond to new DERControls', () => {
        const derControlsHelper = new DerControlsHelper({
            client: sep2Client,
        });

        const respondDerControlSpy = vi.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            (derControlsHelper as any).derControlResponseHelper,
            'respondDerControl',
        );

        derControlsHelper.updateFsaData([
            {
                functionSetAssignments: generateMockFunctionSetAssignments({}),
                derProgramList: [
                    {
                        program: generateMockDERProgram({}),
                        derControls: [
                            generateMockDERControl({
                                eventStatus: {
                                    currentStatus: CurrentStatus.Scheduled,
                                },
                                derControlBase: {},
                            }),
                        ],
                        defaultDerControl: undefined,
                    },
                ],
            },
        ]);

        expect(respondDerControlSpy).toHaveBeenCalledTimes(1);
    });
});

describe('sortMergedControlsDataByStartTimeAscending', () => {
    it('should sort by start time ascending', () => {
        const control1: MergedControlsData = {
            fsa: generateMockFunctionSetAssignments({}),
            program: generateMockDERProgram({}),
            control: generateMockDERControl({
                interval: { start: new Date('2024-01-01T00:00:06Z') },
            }),
        };

        const control2: MergedControlsData = {
            fsa: generateMockFunctionSetAssignments({}),
            program: generateMockDERProgram({}),
            control: generateMockDERControl({
                interval: { start: new Date('2024-01-01T00:00:03Z') },
            }),
        };

        const controls: MergedControlsData[] = [control1, control2];

        const result = controls.sort(
            sortMergedControlsDataByStartTimeAscending,
        );

        expect(result[0]?.control).toEqual(control2.control);
    });
});
