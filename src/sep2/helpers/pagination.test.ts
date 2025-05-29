import { afterEach, type MockInstance } from 'vitest';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { SEP2Client } from '../client.js';
import { type List } from '../models/list.js';
import { mockCert, mockKey } from '../../../tests/sep2/cert.js';
import { getListAll } from './pagination.js';

type MockStringsList = List & {
    strings: string[];
};

let sep2Client: SEP2Client;
let mockGetCalls: MockInstance<typeof sep2Client.get>;

beforeAll(() => {
    sep2Client = new SEP2Client({
        host: 'http://example.com',
        cert: mockCert,
        cacert: mockCert,
        key: mockKey,
        pen: '12345',
    });

    mockGetCalls = vi.spyOn(sep2Client, 'get');
});

afterEach(() => {
    // spyOn reuses mocks, the "toBeCalledTimes" is not reset
    // https://vitest.dev/guide/migration.html#vi-spyon-reuses-mock-if-method-is-already-mocked
    mockGetCalls.mockReset();
});

describe('getListAll', () => {
    const mockParseXml = vi.fn((xml: unknown): MockStringsList => {
        return xml as MockStringsList;
    });

    const mockAddItems = vi.fn(
        (allResults: MockStringsList, result: MockStringsList) => {
            allResults.strings.push(...result.strings);
        },
    );

    const mockGetItems = vi.fn((result: MockStringsList) => {
        return result.strings;
    });

    it('should return all results when pagination works correctly', async () => {
        // Arrange
        const mockResults: MockStringsList[] = [
            { all: 4, results: 2, strings: ['test1', 'test2'] },
            { all: 4, results: 2, strings: ['test3', 'test4'] },
        ];

        mockGetCalls
            .mockResolvedValueOnce(mockResults[0])
            .mockResolvedValueOnce(mockResults[1]);

        // Act
        const result = await getListAll({
            client: sep2Client,
            url: '/mockUrl',
            parseXml: mockParseXml,
            addItems: mockAddItems,
            getItems: mockGetItems,
        });

        // Assert
        expect(result.strings.length).toBe(4);
        expect(result.strings).toEqual(['test1', 'test2', 'test3', 'test4']);
        expect(mockGetCalls).toBeCalledTimes(2);
        expect(mockGetCalls).nthCalledWith(1, '/mockUrl', {
            params: { s: '0', l: '10' },
        });
        expect(mockGetCalls).nthCalledWith(2, '/mockUrl', {
            params: { s: '10', l: '10' },
        });
    });

    it('should throw an error if there are more items than returned', async () => {
        // Arrange
        const mockResults: MockStringsList[] = [
            { all: 4, results: 2, strings: ['test1', 'test2'] },
            { all: 4, results: 0, strings: [] },
        ];

        mockGetCalls
            .mockResolvedValueOnce(mockResults[0])
            .mockResolvedValueOnce(mockResults[1]);

        // Act & Assert
        await expect(
            getListAll({
                client: sep2Client,
                url: '/mockUrl',
                parseXml: mockParseXml,
                addItems: mockAddItems,
                getItems: mockGetItems,
            }),
        ).rejects.toThrow('There are more items (4) than returned (2)');
        expect(mockGetCalls).toBeCalledTimes(2);
    });

    it('should not throw if there are no results', async () => {
        // Arrange
        const mockResult: MockStringsList = {
            all: 0,
            results: 0,
            strings: [],
        };

        mockGetCalls.mockResolvedValue(mockResult);

        // Act
        const result = await getListAll({
            client: sep2Client,
            url: '/mockUrl',
            parseXml: mockParseXml,
            addItems: mockAddItems,
            getItems: mockGetItems,
        });

        // Assert
        expect(result.strings.length).toBe(0);
        expect(mockGetCalls).toBeCalledTimes(1);
    });
});
