import { describe, expect, it, vi } from 'vitest';
import { SEP2Client } from '../client.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';
import type { MergedControlsData } from './derControls.js';
import {
    DerControlsHelper,
    sortMergedControlsDataByStartTimeAscending,
} from './derControls.js';
import { CurrentStatus } from '../models/eventStatus.js';
import { generateMockDERControl } from '../../../tests/sep2/DERControl.js';
import { generateMockDERProgram } from '../../../tests/sep2/DERProgram.js';
import { generateMockFunctionSetAssignments } from '../../../tests/sep2/FunctionSetAssignments.js';
import type { DERControl } from '../models/derControl.js';

const sep2Client = new SEP2Client({
    sep2Config: {
        host: 'http://example.com',
        dcapUri: '/dcap',
    },
    cert: mockCert,
    key: mockKey,
    pen: '12345',
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

    it('should not respond to existing DERControls unchanged status', () => {
        const derControlsHelper = new DerControlsHelper({
            client: sep2Client,
        });

        const control1 = generateMockDERControl({
            eventStatus: {
                currentStatus: CurrentStatus.Scheduled,
            },
            derControlBase: {},
        });

        derControlsHelper.updateFsaData([
            {
                functionSetAssignments: generateMockFunctionSetAssignments({}),
                derProgramList: [
                    {
                        program: generateMockDERProgram({}),
                        derControls: [control1],
                        defaultDerControl: undefined,
                    },
                ],
            },
        ]);

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
                        derControls: [control1],
                        defaultDerControl: undefined,
                    },
                ],
            },
        ]);

        expect(respondDerControlSpy).toHaveBeenCalledTimes(0);
    });

    it('should respond to existing DERControls changed status', () => {
        const derControlsHelper = new DerControlsHelper({
            client: sep2Client,
        });

        const control1 = generateMockDERControl({
            eventStatus: {
                currentStatus: CurrentStatus.Scheduled,
            },
            derControlBase: {},
        });

        derControlsHelper.updateFsaData([
            {
                functionSetAssignments: generateMockFunctionSetAssignments({}),
                derProgramList: [
                    {
                        program: generateMockDERProgram({}),
                        derControls: [control1],
                        defaultDerControl: undefined,
                    },
                ],
            },
        ]);

        const respondDerControlSpy = vi.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            (derControlsHelper as any).derControlResponseHelper,
            'respondDerControl',
        );

        const control1Cancelled: DERControl = {
            ...control1,
            eventStatus: {
                ...control1.eventStatus,
                currentStatus: CurrentStatus.Cancelled,
            },
        };

        derControlsHelper.updateFsaData([
            {
                functionSetAssignments: generateMockFunctionSetAssignments({}),
                derProgramList: [
                    {
                        program: generateMockDERProgram({}),
                        derControls: [control1Cancelled],
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
