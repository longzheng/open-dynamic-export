import * as v from 'valibot';
import { assertString } from '../helpers/assert.js';
import { xmlns } from '../helpers/namespace.js';

export const connectionPointSchema = v.object({
    connectionPointId: v.optional(v.string()),
});

export type ConnectionPoint = v.InferOutput<typeof connectionPointSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseConnectionPointXml(xml: any): ConnectionPoint {
    /* oxlint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const object = xml['csipaus:ConnectionPoint'];
    /* oxlint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return parseConnectionPointXmlObject(object);
}

export function parseConnectionPointXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): ConnectionPoint {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const connectionPointId = xmlObject['csipaus:connectionPointId']
        ? assertString(xmlObject['csipaus:connectionPointId'][0])
        : undefined;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        connectionPointId,
    };
}

export function generateConnectionPointResponse({
    connectionPointId,
}: ConnectionPoint) {
    return {
        'csipaus:ConnectionPoint': {
            $: { 'xmlns:csipaus': xmlns.csipaus },
            'csipaus:connectionPointId': connectionPointId,
        },
    };
}
