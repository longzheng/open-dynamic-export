import type { SEP2Client } from '../client';
import type { List } from '../models/list';

export interface PaginationOptions<T extends List> {
    client: SEP2Client;
    url: string;
    parseXml: (xml: unknown) => T;
    addItems: (allResults: T, result: T) => void;
    getItems: (result: T) => unknown[];
    limit?: number;
}

export async function getListAll<T extends List>({
    client,
    url,
    parseXml,
    addItems,
    getItems,
    limit = 10, // Default to 10 if not provided
}: PaginationOptions<T>): Promise<T> {
    let allResults: T | null = null;

    for await (const result of getListPageGenerator({
        client,
        url,
        limit,
        parseXml,
    })) {
        if (!allResults) {
            allResults = result;
        } else {
            addItems(allResults, result);
        }
    }

    if (!allResults) {
        throw new Error('No result');
    }

    const totalItems = getItems(allResults).length;

    if (allResults.all > totalItems) {
        throw new Error(
            `There are more items (${allResults.all}) than returned (${totalItems})`,
        );
    }

    return allResults;
}

async function* getListPageGenerator<T extends List>({
    client,
    url,
    limit,
    parseXml,
}: Omit<PaginationOptions<T>, 'addItems' | 'getItems'> & {
    limit: number;
}): AsyncGenerator<T> {
    let startIndex = 0;

    for (;;) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await client.get(url, {
            s: startIndex.toString(),
            l: limit.toString(),
        });

        const result = parseXml(xml);

        yield result;

        if (result.results === 0) {
            break;
        }

        startIndex += limit;
    }
}
