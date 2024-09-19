import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    ControlSchedule,
    RandomizedControlSchedule,
} from './controlScheduler.js';
import {
    generateControlsSchedule,
    filterControlsOfType,
    getSortedUniqueDatetimesFromControls,
    applyRandomizationToControlSchedule,
    applyRandomizationToDatetime,
} from './controlScheduler.js';
import type { MergedControlsData } from './derControls.js';
import { generateMockDERControl } from '../../../tests/sep2/DERControl.js';
import { generateMockDERProgram } from '../../../tests/sep2/DERProgram.js';
import { generateMockFunctionSetAssignments } from '../../../tests/sep2/FunctionSetAssignments.js';
import { randomInt } from 'crypto';

vi.mock('crypto', async () => {
    const actual = await import('crypto');
    return {
        ...actual,
        randomInt: vi.fn(actual.randomInt),
    };
});

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('filterControlsOfType', () => {
    it('should return controls of type', () => {
        type Data = Parameters<
            typeof filterControlsOfType
        >[0]['activeOrScheduledControls'][number];

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
            activeOrScheduledControls: [control1, control2, control3, control4],
            type: 'opModExpLimW',
        });

        expect(result).toStrictEqual([control1, control3]);
    });

    it('should handle undefined', () => {
        type Data = Parameters<
            typeof filterControlsOfType
        >[0]['activeOrScheduledControls'][number];

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
            activeOrScheduledControls: [control1, control2],
            type: 'opModExpLimW',
        });

        expect(result).toStrictEqual([control1]);
    });
});

describe('generateControlsSchedule', () => {
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
            activeOrScheduledControlsOfType: [],
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
            activeOrScheduledControlsOfType: [controlA],
        });

        expect(result.length).toStrictEqual(1);

        expect(result[0]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[0]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );
        expect(result[0]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:10Z'),
        );
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
            activeOrScheduledControlsOfType: [controlA, controlB, controlC],
        });

        expect(result.length).toStrictEqual(3);

        expect(result[0]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[0]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );
        expect(result[0]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:10Z'),
        );

        expect(result[1]?.data.control.mRID).toStrictEqual(
            controlB.control.mRID,
        );
        expect(result[1]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:10Z'),
        );
        expect(result[1]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:15Z'),
        );

        expect(result[2]?.data.control.mRID).toStrictEqual(
            controlC.control.mRID,
        );
        expect(result[2]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:20Z'),
        );
        expect(result[2]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:25Z'),
        );
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
            activeOrScheduledControlsOfType: [
                controlA,
                controlB,
                controlC,
                controlD,
            ],
        });

        expect(result.length).toStrictEqual(5);

        expect(result[0]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[0]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:00Z'),
        );
        expect(result[0]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:02Z'),
        );

        expect(result[1]?.data.control.mRID).toStrictEqual(
            controlB.control.mRID,
        );
        expect(result[1]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:02Z'),
        );
        expect(result[1]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:03Z'),
        );

        expect(result[2]?.data.control.mRID).toStrictEqual(
            controlC.control.mRID,
        );
        expect(result[2]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:03Z'),
        );
        expect(result[2]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );

        expect(result[3]?.data.control.mRID).toStrictEqual(
            controlD.control.mRID,
        );
        expect(result[3]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:06Z'),
        );
        expect(result[3]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:07Z'),
        );

        expect(result[4]?.data.control.mRID).toStrictEqual(
            controlA.control.mRID,
        );
        expect(result[4]?.startInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:07Z'),
        );
        expect(result[4]?.endExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:10Z'),
        );
    });
});

describe('getUniqueDatetimesFromControls', () => {
    it('should return unique date times', () => {
        type Data = Parameters<
            typeof getSortedUniqueDatetimesFromControls
        >[0][number];

        const control1: Data = {
            control: {
                interval: {
                    start: new Date('2024-01-01T00:00:00Z'),
                    duration: 10,
                },
            },
        };

        const control2: Data = {
            control: {
                interval: {
                    start: new Date('2024-01-01T00:00:05Z'),
                    duration: 10,
                },
            },
        };

        const control3: Data = {
            control: {
                interval: {
                    start: new Date('2024-01-01T00:00:00Z'),
                    duration: 10,
                },
            },
        };

        const result = getSortedUniqueDatetimesFromControls([
            control1,
            control2,
            control3,
        ]);

        expect(result).toStrictEqual([
            new Date('2024-01-01T00:00:00Z'),
            new Date('2024-01-01T00:00:05Z'),
            new Date('2024-01-01T00:00:10Z'),
            new Date('2024-01-01T00:00:15Z'),
        ]);
    });

    it('should handle out of order controls', () => {
        type Data = Parameters<
            typeof getSortedUniqueDatetimesFromControls
        >[0][number];

        const control1: Data = {
            control: {
                interval: {
                    start: new Date('2024-01-01T00:00:10Z'),
                    duration: 10,
                },
            },
        };

        const control2: Data = {
            control: {
                interval: {
                    start: new Date('2024-01-01T00:00:05Z'),
                    duration: 10,
                },
            },
        };

        const result = getSortedUniqueDatetimesFromControls([
            control1,
            control2,
        ]);

        expect(result).toStrictEqual([
            new Date('2024-01-01T00:00:05Z'),
            new Date('2024-01-01T00:00:10Z'),
            new Date('2024-01-01T00:00:15Z'),
            new Date('2024-01-01T00:00:20Z'),
        ]);
    });
});

describe('applyRandomizationToControlSchedule', () => {
    it('should randomize control schedules', () => {
        const controlA: ControlSchedule = {
            data: {
                fsa: generateMockFunctionSetAssignments({}),
                program: generateMockDERProgram({}),
                control: generateMockDERControl({
                    interval: {
                        start: new Date('2024-01-01T00:00:00Z'),
                        duration: 10,
                    },
                    randomizeStart: 2,
                    randomizeDuration: 5,
                }),
            },
            startInclusive: new Date('2024-01-01T00:00:00Z'),
            endExclusive: new Date('2024-01-01T00:00:10Z'),
            randomizeStart: 2,
            randomizeDuration: 5,
        };

        const controlB: ControlSchedule = {
            data: {
                fsa: generateMockFunctionSetAssignments({}),
                program: generateMockDERProgram({}),
                control: generateMockDERControl({
                    interval: {
                        start: new Date('2024-01-01T00:00:10Z'),
                        duration: 10,
                    },
                    randomizeStart: 2,
                    randomizeDuration: 5,
                }),
            },
            startInclusive: new Date('2024-01-01T00:00:10Z'),
            endExclusive: new Date('2024-01-01T00:00:20Z'),
            randomizeStart: 2,
            randomizeDuration: 5,
        };

        const controlC: ControlSchedule = {
            data: {
                fsa: generateMockFunctionSetAssignments({}),
                program: generateMockDERProgram({}),
                control: generateMockDERControl({
                    interval: {
                        start: new Date('2024-01-01T00:00:20Z'),
                        duration: 10,
                    },
                    randomizeStart: 0,
                    randomizeDuration: 0,
                }),
            },
            startInclusive: new Date('2024-01-01T00:00:20Z'),
            endExclusive: new Date('2024-01-01T00:00:30Z'),
            randomizeStart: 0,
            randomizeDuration: 0,
        };

        const activeControlSchedule: RandomizedControlSchedule = {
            ...controlA,
            effectiveStartInclusive: new Date('2024-01-01T00:00:01Z'),
            effectiveEndExclusive: new Date('2024-01-01T00:00:13Z'),
        };

        const result = applyRandomizationToControlSchedule({
            controlSchedules: [controlA, controlB, controlC],
            activeControlSchedule,
        });

        expect(result.length).toStrictEqual(3);

        // leave the active control schedule unchanged
        expect(result[0]?.effectiveStartInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:01Z'),
        );
        expect(result[0]?.effectiveEndExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:13Z'),
        );

        expect(result[1]?.effectiveStartInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:13Z'),
        );
        expect(
            result[1]?.effectiveEndExclusive.getTime(),
        ).toBeGreaterThanOrEqual(new Date('2024-01-01T00:00:20Z').getTime());
        expect(result[1]?.effectiveEndExclusive.getTime()).toBeLessThanOrEqual(
            new Date('2024-01-01T00:00:25Z').getTime(),
        );

        expect(result[2]?.effectiveStartInclusive).toStrictEqual(
            result[1]?.effectiveEndExclusive,
        );
        expect(result[2]?.effectiveEndExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:30Z'),
        );
    });

    it('non-successive events with randomization should not cause conflicts', () => {
        // override crypto.randomInt implementation to always return the max value
        vi.mocked(randomInt)
            .mockImplementationOnce(() => 5)
            .mockImplementationOnce(() => -5);

        const controlA: ControlSchedule = {
            data: {
                fsa: generateMockFunctionSetAssignments({}),
                program: generateMockDERProgram({}),
                control: generateMockDERControl({
                    interval: {
                        start: new Date('2024-01-01T00:00:00Z'),
                        duration: 10,
                    },
                    randomizeStart: 0,
                    randomizeDuration: 5,
                }),
            },
            startInclusive: new Date('2024-01-01T00:00:00Z'),
            endExclusive: new Date('2024-01-01T00:00:10Z'),
            randomizeStart: 0,
            randomizeDuration: 5,
        };

        const controlB: ControlSchedule = {
            data: {
                fsa: generateMockFunctionSetAssignments({}),
                program: generateMockDERProgram({}),
                control: generateMockDERControl({
                    interval: {
                        start: new Date('2024-01-01T00:00:13Z'),
                        duration: 10,
                    },
                    randomizeStart: -5,
                    randomizeDuration: 0,
                }),
            },
            startInclusive: new Date('2024-01-01T00:00:10Z'),
            endExclusive: new Date('2024-01-01T00:00:20Z'),
            randomizeStart: -5,
            randomizeDuration: 0,
        };

        const result = applyRandomizationToControlSchedule({
            controlSchedules: [controlA, controlB],
            activeControlSchedule: null,
        });

        expect(result.length).toStrictEqual(2);

        expect(result[0]?.effectiveStartInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:00Z'),
        );
        expect(result[0]?.effectiveEndExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:15Z'),
        );

        expect(result[1]?.effectiveStartInclusive).toStrictEqual(
            new Date('2024-01-01T00:00:15Z'),
        );
        expect(result[1]?.effectiveEndExclusive).toStrictEqual(
            new Date('2024-01-01T00:00:20Z'),
        );
    });
});

describe('applyRandomizationToDatetime', () => {
    it('supports positive randomization', () => {
        const date = new Date('2024-01-01T00:00:00Z');

        const result = applyRandomizationToDatetime({
            date,
            randomizationSeconds: 10,
        });

        expect(result.getTime()).toBeGreaterThanOrEqual(
            new Date('2024-01-01T00:00:00Z').getTime(),
        );
        expect(result.getTime()).toBeLessThanOrEqual(
            new Date('2024-01-01T00:00:10Z').getTime(),
        );
    });

    it('supports positive 1 randomization', () => {
        const date = new Date('2024-01-01T00:00:00Z');

        const result = applyRandomizationToDatetime({
            date,
            randomizationSeconds: 1,
        });

        expect(result.getTime()).toBeGreaterThanOrEqual(
            new Date('2024-01-01T00:00:00Z').getTime(),
        );
        expect(result.getTime()).toBeLessThanOrEqual(
            new Date('2024-01-01T00:00:01Z').getTime(),
        );
    });

    it('supports 0 randomization', () => {
        const date = new Date('2024-01-01T00:00:00Z');

        const result = applyRandomizationToDatetime({
            date,
            randomizationSeconds: 0,
        });

        expect(result).toStrictEqual(new Date('2024-01-01T00:00:00Z'));
    });

    it('supports negative randomization', () => {
        const date = new Date('2024-01-01T00:00:30Z');

        const result = applyRandomizationToDatetime({
            date,
            randomizationSeconds: -10,
        });

        expect(result.getTime()).toBeGreaterThanOrEqual(
            new Date('2024-01-01T00:00:20Z').getTime(),
        );
        expect(result.getTime()).toBeLessThanOrEqual(
            new Date('2024-01-01T00:00:30Z').getTime(),
        );
    });
});
