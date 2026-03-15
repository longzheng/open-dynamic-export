import { describe, expect, it } from 'vitest';
import { CurrentStatus } from '../models/currentStatus.js';
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
            control: {
                creationTime: new Date(),
                eventStatus: { currentStatus: CurrentStatus.Scheduled },
            },
        };
        const b: Data = {
            program: { primacy: 2 },
            control: {
                creationTime: new Date(),
                eventStatus: { currentStatus: CurrentStatus.Scheduled },
            },
        };

        const result = [b, a].sort(sortByProgramPrimacyAndEventCreationTime);

        expect(result).toStrictEqual([a, b]);
    });

    it('should sort by creation time if primacy the same', () => {
        const a: Data = {
            program: { primacy: 1 }, // lower primacy
            control: {
                creationTime: new Date(1724047806690),
                eventStatus: { currentStatus: CurrentStatus.Scheduled },
            },
        };
        const b: Data = {
            program: { primacy: 2 }, // older
            control: {
                creationTime: new Date(1724047806690),
                eventStatus: { currentStatus: CurrentStatus.Scheduled },
            },
        };
        const c: Data = {
            program: { primacy: 2 }, // newer
            control: {
                creationTime: new Date(1724047806695),
                eventStatus: { currentStatus: CurrentStatus.Scheduled },
            },
        };

        const result = [c, b, a].sort(sortByProgramPrimacyAndEventCreationTime);

        expect(result).toStrictEqual([a, c, b]);
    });

    it('should sort non-superseded controls before superseded controls when primacy is the same', () => {
        const nonSupersededScheduled: Data = {
            program: { primacy: 1 },
            control: {
                creationTime: new Date(1724047806690), // older than superseded
                eventStatus: { currentStatus: CurrentStatus.Scheduled },
            },
        };
        const nonSupersededActive: Data = {
            program: { primacy: 1 },
            control: {
                creationTime: new Date(1724047806680), // older than superseded
                eventStatus: { currentStatus: CurrentStatus.Active },
            },
        };
        const superseded: Data = {
            program: { primacy: 1 },
            control: {
                creationTime: new Date(1724047806695),
                eventStatus: { currentStatus: CurrentStatus.Superseded },
            },
        };

        const result = [
            superseded,
            nonSupersededScheduled,
            nonSupersededActive,
        ].sort(sortByProgramPrimacyAndEventCreationTime);

        expect(result).toStrictEqual([
            nonSupersededScheduled,
            nonSupersededActive,
            superseded,
        ]);
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
