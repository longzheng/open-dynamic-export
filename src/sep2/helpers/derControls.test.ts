import { describe, expect, it } from 'vitest';
import {
    getControlsOfType,
    getOverlappingDerControls,
    resolveOverlappingDerControls,
    sortByProgramPrimacy,
    sortByProgramPrimacyAndEventCreationTime,
} from './derControls';

describe('sortByProgramPrimacy', () => {
    type Data = Parameters<typeof sortByProgramPrimacy>[0];

    it('should sort by program primacy', () => {
        const a: Data = { program: { primacy: 1 } };
        const b: Data = { program: { primacy: 2 } };

        const result = [b, a].sort(sortByProgramPrimacy);

        expect(result).toStrictEqual([a, b]);
    });
});

describe('sortByProgramPrimacyAndEventCreationTime', () => {
    type Data = Parameters<typeof sortByProgramPrimacyAndEventCreationTime>[0];

    it('should sort by program primacy first', () => {
        const a: Data = {
            program: { primacy: 1 },
            control: { creationTime: new Date() },
        };
        const b: Data = {
            program: { primacy: 2 },
            control: { creationTime: new Date() },
        };

        const result = [b, a].sort(sortByProgramPrimacyAndEventCreationTime);

        expect(result).toStrictEqual([a, b]);
    });

    it('should sort by creation time if primacy the same', () => {
        const a: Data = {
            program: { primacy: 1 }, // lower primacy
            control: { creationTime: new Date(1724047806690) },
        };
        const b: Data = {
            program: { primacy: 2 }, // older
            control: { creationTime: new Date(1724047806690) },
        };
        const c: Data = {
            program: { primacy: 2 }, // newer
            control: { creationTime: new Date(1724047806695) },
        };

        const result = [c, b, a].sort(sortByProgramPrimacyAndEventCreationTime);

        expect(result).toStrictEqual([a, c, b]);
    });
});

describe('getOverlappingDerControls', () => {
    type Data = Parameters<
        typeof getOverlappingDerControls
    >[0]['evaluateDerControl'];

    it('should return overlapping controls within period', () => {
        const control1: Data = {
            control: {
                mRID: '1',
                interval: { start: new Date(5 * 1000), duration: 10 },
            },
        };

        // inside the period
        const control2: Data = {
            control: {
                mRID: '2',
                interval: { start: new Date(10 * 1000), duration: 3 },
            },
        };

        // overlap end/start
        const control3: Data = {
            control: {
                mRID: '3',
                interval: { start: new Date(15 * 1000), duration: 10 },
            },
        };

        // completely outside of the period
        const control4: Data = {
            control: {
                mRID: '4',
                interval: { start: new Date(25 * 1000), duration: 10 },
            },
        };

        const control5: Data = {
            control: {
                mRID: '4',
                interval: { start: new Date(0 * 1000), duration: 5 },
            },
        };

        const result = getOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [control1, control2, control3, control4, control5],
        });

        expect(result).toStrictEqual([control2]);
    });

    it('should return overlapping controls with the same period', () => {
        const control1: Data = {
            control: {
                mRID: '1',
                interval: { start: new Date(0 * 1000), duration: 10 },
            },
        };

        // same period
        const control2: Data = {
            control: {
                mRID: '2',
                interval: { start: new Date(0 * 1000), duration: 10 },
            },
        };

        // overlap end/start
        const control3: Data = {
            control: {
                mRID: '3',
                interval: { start: new Date(10 * 1000), duration: 10 },
            },
        };

        // completely outside of the period
        const control4: Data = {
            control: {
                mRID: '4',
                interval: { start: new Date(20 * 1000), duration: 10 },
            },
        };

        const result = getOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [control1, control2, control3, control4],
        });

        expect(result).toStrictEqual([control2]);
    });

    it('should return overlapping controls with partial range at end', () => {
        const control1: Data = {
            control: {
                mRID: '1',
                interval: { start: new Date(0 * 1000), duration: 10 },
            },
        };

        // overlap end
        const control2: Data = {
            control: {
                mRID: '2',
                interval: { start: new Date(5 * 1000), duration: 10 },
            },
        };

        // overlap end/start
        const control3: Data = {
            control: {
                mRID: '3',
                interval: { start: new Date(10 * 1000), duration: 10 },
            },
        };

        // completely outside of the period
        const control4: Data = {
            control: {
                mRID: '4',
                interval: { start: new Date(20 * 1000), duration: 10 },
            },
        };

        const result = getOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [control1, control2, control3, control4],
        });

        expect(result).toStrictEqual([control2]);
    });

    it('should return overlapping controls with mix', () => {
        const control1: Data = {
            control: {
                mRID: '1',
                interval: { start: new Date(0 * 1000), duration: 10 },
            },
        };

        // within period
        const control2: Data = {
            control: {
                mRID: '2',
                interval: { start: new Date(3 * 1000), duration: 2 },
            },
        };

        // within period
        const control3: Data = {
            control: {
                mRID: '2',
                interval: { start: new Date(5 * 1000), duration: 2 },
            },
        };

        // overlap end
        const control4: Data = {
            control: {
                mRID: '3',
                interval: { start: new Date(7 * 1000), duration: 10 },
            },
        };

        // overlap end/start
        const control5: Data = {
            control: {
                mRID: '4',
                interval: { start: new Date(10 * 1000), duration: 10 },
            },
        };

        // completely outside of the period
        const control6: Data = {
            control: {
                mRID: '4',
                interval: { start: new Date(20 * 1000), duration: 10 },
            },
        };

        const result = getOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [
                control1,
                control2,
                control3,
                control4,
                control5,
                control6,
            ],
        });

        expect(result).toStrictEqual([control2, control3, control4]);
    });
});

describe('resolveOverlappingDerControls', () => {
    type Data = Parameters<
        typeof resolveOverlappingDerControls
    >[0]['evaluateDerControl'];

    it('should return evaluated control if no overlap', () => {
        const control1: Data = {
            program: {
                primacy: 0,
            },
            control: {
                mRID: '1',
                interval: { start: new Date(0 * 1000), duration: 10 },
                creationTime: new Date(0 * 1000),
            },
        };

        // completely outside of the period
        const control2: Data = {
            program: {
                primacy: 0,
            },
            control: {
                mRID: '2',
                interval: { start: new Date(10 * 1000), duration: 10 },
                creationTime: new Date(0 * 1000),
            },
        };

        const result = resolveOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [control1, control2],
        });

        expect(result).toStrictEqual(control1);
    });

    it('should return exact overlap with lower primacy', () => {
        const control1: Data = {
            program: {
                primacy: 1,
            },
            control: {
                mRID: '1',
                interval: { start: new Date(0 * 1000), duration: 10 },
                creationTime: new Date(0 * 1000),
            },
        };

        // same period
        const control2: Data = {
            program: {
                primacy: 0,
            },
            control: {
                mRID: '2',
                interval: { start: new Date(0 * 1000), duration: 10 },
                creationTime: new Date(0 * 1000),
            },
        };

        const result = resolveOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [control1, control2],
        });

        expect(result).toStrictEqual(control2);
    });

    it('should return exact overlap with same primacy but newer date', () => {
        const control1: Data = {
            program: {
                primacy: 1,
            },
            control: {
                mRID: '1',
                interval: { start: new Date(5 * 1000), duration: 10 },
                creationTime: new Date(0 * 1000),
            },
        };

        // same period
        const control2: Data = {
            program: {
                primacy: 1,
            },
            control: {
                mRID: '2',
                interval: { start: new Date(5 * 1000), duration: 10 },
                creationTime: new Date(1 * 1000),
            },
        };

        const result = resolveOverlappingDerControls({
            evaluateDerControl: control1,
            allDerControls: [control1, control2],
        });

        expect(result).toStrictEqual(control2);
    });

    // example from CSIP Implementation guide page 51 figure 34
    it('should return overlap within with lower primacy', () => {
        const dercB: Data = {
            program: {
                primacy: 1,
            },
            control: {
                mRID: '1',
                interval: { start: new Date(3 * 1000), duration: 7 },
                creationTime: new Date(1 * 1000),
            },
        };

        const dercA: Data = {
            program: {
                primacy: 1,
            },
            control: {
                mRID: '2',
                interval: { start: new Date(6 * 1000), duration: 3 },
                creationTime: new Date(2 * 1000),
            },
        };

        const result = resolveOverlappingDerControls({
            evaluateDerControl: dercB,
            allDerControls: [dercB, dercA],
        });

        expect(result).toStrictEqual(dercA);
    });
});

describe('getControlsOfType', () => {
    it('should return controls of type', () => {
        type Data = Parameters<typeof getControlsOfType>[0]['controls'][number];

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

        const result = getControlsOfType({
            controls: [control1, control2, control3, control4],
            types: ['opModExpLimW'],
        });

        expect(result).toStrictEqual([control1, control3]);
    });
});
