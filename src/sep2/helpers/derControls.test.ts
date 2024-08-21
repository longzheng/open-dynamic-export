import { describe, expect, it, vi } from 'vitest';
import { SEP2Client } from '../client';
import { mockCert, mockKey } from '../../../tests/sep2/cert';
import type { MergedControlsData } from './derControls';
import {
    DerControlsHelper,
    sortMergedControlsDataByStartTimeAscending,
} from './derControls';
import { CurrentStatus } from '../models/eventStatus';
import { ResponseRequiredType } from '../models/responseRequired';
import { generateMockDERControl } from '../../../tests/sep2/DERControl';
import { generateMockDERProgram } from '../../../tests/sep2/DERProgram';
import { generateMockFunctionSetAssignments } from '../../../tests/sep2/FunctionSetAssignments';

const sep2Client = new SEP2Client({
    sep2Config: {
        host: 'http://example.com',
        dcapUri: '/dcap',
        pen: 12345,
    },
    cert: mockCert,
    key: mockKey,
});

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
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                        program: generateMockDERProgram({}),
                        derControls: [
                            {
                                href: '/api/v2/derp/TESTPRG2/derc/DB71668E668F4EC9BABAA70AC8598B7D',
                                replyToHref: '/api/v2/rsps/res-ms/rsp',
                                responseRequired:
                                    ResponseRequiredType.MessageReceived |
                                    ResponseRequiredType.SpecificResponse,
                                subscribable: false,
                                description: undefined,
                                mRID: 'DERC A',
                                version: 0,
                                creationTime: new Date('2024-01-01T00:00:00Z'),
                                interval: {
                                    start: new Date('2024-01-01T00:00:06Z'),
                                    duration: 3,
                                },
                                eventStatus: {
                                    currentStatus: CurrentStatus.Scheduled,
                                    dateTime: new Date('2024-01-01T00:00:00Z'),
                                    potentiallySuperseded: false,
                                    potentiallySupersededTime: new Date(
                                        '2024-01-01T00:00:00Z',
                                    ),
                                    reason: '',
                                },
                                randomizeStart: undefined,
                                randomizeDuration: undefined,
                                derControlBase: {
                                    opModImpLimW: {
                                        value: 0,
                                        multiplier: 0,
                                    },
                                    opModExpLimW: {
                                        value: 0,
                                        multiplier: 0,
                                    },
                                },
                            },
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
                intervalStart: new Date('2024-01-01T00:00:06Z'),
            }),
        };

        const control2: MergedControlsData = {
            fsa: generateMockFunctionSetAssignments({}),
            program: generateMockDERProgram({}),
            control: generateMockDERControl({
                intervalStart: new Date('2024-01-01T00:00:03Z'),
            }),
        };

        const controls: MergedControlsData[] = [control1, control2];

        const result = controls.sort(
            sortMergedControlsDataByStartTimeAscending,
        );

        expect(result[0]?.control).toEqual(control2.control);
    });
});
