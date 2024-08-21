import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ControlSchedule } from './controlScheduler';
import {
    generateControlsSchedule,
    filterControlsOfType,
} from './controlScheduler';
import type { MergedControlsData } from './derControls';
import { generateMockDERControl } from '../../../tests/sep2/DERControl';
import { generateMockDERProgram } from '../../../tests/sep2/DERProgram';
import { generateMockFunctionSetAssignments } from '../../../tests/sep2/FunctionSetAssignments';

describe('filterControlsOfType', () => {
    it('should return controls of type', () => {
        type Data = Parameters<
            typeof filterControlsOfType
        >[0]['controls'][number];

        const control1: Data = {
            control: {
                derControlBase: {
                    opModEnergize: true,
                    opModExpLimW: {
                        value: 1,
                        multiplier: 4,
                    },
                },
            },
        };

        const control2: Data = {
            control: {
                derControlBase: {
                    opModEnergize: true,
                },
            },
        };

        const control3: Data = {
            control: {
                derControlBase: {
                    opModExpLimW: {
                        value: 1,
                        multiplier: 4,
                    },
                    opModImpLimW: {
                        value: 1,
                        multiplier: 4,
                    },
                },
            },
        };

        const control4: Data = {
            control: {
                derControlBase: {},
            },
        };

        const result = filterControlsOfType({
            controls: [control1, control2, control3, control4],
            type: 'opModExpLimW',
        });

        expect(result).toStrictEqual([control1, control3]);
    });

    it('should handle undefined', () => {
        type Data = Parameters<
            typeof filterControlsOfType
        >[0]['controls'][number];

        const control1: Data = {
            control: {
                derControlBase: {
                    opModEnergize: true,
                    opModExpLimW: {
                        value: 1,
                        multiplier: 4,
                    },
                },
            },
        };

        const control2: Data = {
            control: {
                derControlBase: {
                    opModExpLimW: undefined,
                },
            },
        };

        const result = filterControlsOfType({
            controls: [control1, control2],
            type: 'opModExpLimW',
        });

        expect(result).toStrictEqual([control1]);
    });
});

describe('generateControlsSchedule', () => {
    afterEach(() => {
        vi.getRealSystemTime();
    });

    const fsa = generateMockFunctionSetAssignments({});

    const programPrimacy0 = generateMockDERProgram({
        primacy: 0,
    });

    const programPrimacy1 = generateMockDERProgram({
        primacy: 1,
    });

    const programPrimacy2 = generateMockDERProgram({
        primacy: 2,
    });

    it('should generate schedule from no controls', () => {
        const result = generateControlsSchedule({
            controls: [],
        });

        expect(result).toStrictEqual([] satisfies ControlSchedule[]);
    });

    it('should generate schedule from single control', () => {
        const controlA: MergedControlsData = {
            fsa,
            program: programPrimacy0,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:06Z'),
                    duration: 4,
                },

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
            }),
        };

        const result = generateControlsSchedule({
            controls: [controlA],
        });

        expect(result.length).toStrictEqual(1);

        expect(result[0]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[0]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );
        expect(result[0]?.end).toStrictEqual(new Date('2024-01-01T00:00:10Z'));
    });

    it('should generate schedule from multiple non-overlapping control', () => {
        const controlA: MergedControlsData = {
            fsa,
            program: programPrimacy0,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:06Z'),
                    duration: 4,
                },
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
            }),
        };

        const controlB: MergedControlsData = {
            fsa,
            program: programPrimacy1,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:10Z'),
                    duration: 5,
                },
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
            }),
        };

        const controlC: MergedControlsData = {
            fsa,
            program: programPrimacy0,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:20Z'),
                    duration: 5,
                },
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
            }),
        };

        const result = generateControlsSchedule({
            controls: [controlA, controlB, controlC],
        });

        expect(result.length).toStrictEqual(3);

        expect(result[0]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[0]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );
        expect(result[0]?.end).toStrictEqual(new Date('2024-01-01T00:00:10Z'));

        expect(result[1]?.data.control.mRID).toStrictEqual(
            controlB.control.mRID,
        );
        expect(result[1]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:10Z'),
        );
        expect(result[1]?.end).toStrictEqual(new Date('2024-01-01T00:00:15Z'));

        expect(result[2]?.data.control.mRID).toStrictEqual(
            controlC.control.mRID,
        );
        expect(result[2]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:20Z'),
        );
        expect(result[2]?.end).toStrictEqual(new Date('2024-01-01T00:00:25Z'));
    });

    it('should generate schedule from multiple overlapping control', () => {
        const controlA: MergedControlsData = {
            fsa,
            program: programPrimacy2,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:00Z'),
                    duration: 10,
                },
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
            }),
        };

        const controlB: MergedControlsData = {
            fsa,
            program: programPrimacy1,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:02Z'),
                    duration: 2,
                },
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
            }),
        };

        const controlC: MergedControlsData = {
            fsa,
            program: programPrimacy0,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:03Z'),
                    duration: 3,
                },
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
            }),
        };

        const controlD: MergedControlsData = {
            fsa,
            program: programPrimacy1,
            control: generateMockDERControl({
                interval: {
                    start: new Date('2024-01-01T00:00:05Z'),
                    duration: 2,
                },
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
            }),
        };

        const result = generateControlsSchedule({
            controls: [controlA, controlB, controlC, controlD],
        });

        expect(result.length).toStrictEqual(5);

        expect(result[0]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[0]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:00Z'),
        );
        expect(result[0]?.end).toStrictEqual(new Date('2024-01-01T00:00:02Z'));

        expect(result[1]?.data.control.mRID).toStrictEqual(
            controlB.control.mRID,
        );
        expect(result[1]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:02Z'),
        );
        expect(result[1]?.end).toStrictEqual(new Date('2024-01-01T00:00:03Z'));

        expect(result[2]?.data.control.mRID).toStrictEqual(
            controlC.control.mRID,
        );
        expect(result[2]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:03Z'),
        );
        expect(result[2]?.end).toStrictEqual(new Date('2024-01-01T00:00:06Z'));

        expect(result[3]?.data.control.mRID).toStrictEqual(
            controlD.control.mRID,
        );
        expect(result[3]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );
        expect(result[3]?.end).toStrictEqual(new Date('2024-01-01T00:00:07Z'));

        expect(result[4]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[4]?.start).toStrictEqual(
            new Date('2024-01-01T00:00:07Z'),
        );
        expect(result[4]?.end).toStrictEqual(new Date('2024-01-01T00:00:10Z'));
    });
});
