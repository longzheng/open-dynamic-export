import { describe, it, expect, vi, beforeAll } from 'vitest';
import { SEP2Client } from '../client';
import type { List } from '../models/list';
import { mockCert, mockKey } from '../../../tests/sep2/cert';
import { getListAll } from './pagination';

type MockStringsList = List & {
    strings: string[];
};

let sep2Client: SEP2Client;

beforeAll(() => {
    sep2Client = new SEP2Client({
        sep2Config: {
            host: 'http://example.com',
            dcapUri: '/dcap',
            pen: 12345,
        },
        cert: mockCert,
        key: mockKey,
    });
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
            { all: 4, results: 0, strings: [] },
        ];

        vi.spyOn(sep2Client, 'get')
            .mockResolvedValueOnce(mockResults[0])
            .mockResolvedValueOnce(mockResults[1])
            .mockResolvedValueOnce(mockResults[2]);

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
    });

    it('should throw an error if there are more items than returned', async () => {
        // Arrange
        const mockResults: MockStringsList[] = [
            { all: 4, results: 2, strings: ['test1', 'test2'] },
            { all: 4, results: 0, strings: [] },
        ];

        vi.spyOn(sep2Client, 'get')
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
    });

    it('should not throw if there are no results', async () => {
        // Arrange
        const mockResult: MockStringsList = {
            all: 0,
            results: 0,
            strings: [],
        };

        vi.spyOn(sep2Client, 'get').mockResolvedValue(mockResult);

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
    });
});
