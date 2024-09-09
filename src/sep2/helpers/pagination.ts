import type { SEP2Client } from '../client.js';
import type { List } from '../models/list.js';

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
        getItemsLength: () => {
            // we expect this function to be called after some items are added so this should never be null
            if (!allResults) {
                throw new Error('allResults is null');
            }

            return getItems(allResults).length;
        },
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
    getItemsLength,
}: Omit<PaginationOptions<T>, 'addItems' | 'getItems'> & {
    limit: number;
    getItemsLength: () => number;
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

        // stop the generator if the total number of items matches the results all number
        // or we didn't receive any more results (to prevent infinite loops if the count is wrong)
        if (result.all === getItemsLength() || result.results === 0) {
            break;
        }

        startIndex += limit;
    }
}
