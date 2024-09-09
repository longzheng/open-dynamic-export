import { describe, expect, it } from 'vitest';
import {
    getDerControlEndDate,
    sortByProgramPrimacy,
    sortByProgramPrimacyAndEventCreationTime,
} from './derControl.js';

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

describe('getDerControlEndDate', () => {
    it('should return the end date of the control', () => {
        const control = {
            interval: {
                start: new Date(1724047806690),
                duration: 60,
            },
        };

        const result = getDerControlEndDate(control);

        expect(result).toStrictEqual(new Date(1724047806690 + 60 * 1000));
    });
});
