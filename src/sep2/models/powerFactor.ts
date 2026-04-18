import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

export const powerFactorSchema = v.pipe(
    v.object({
        displacement: v.number(),
        multiplier: v.pipe(
            v.number(),
            v.description('Specifies exponent of uom. power of ten multiplier'),
        ),
    }),
    v.description(
        'Specifies a setpoint for Displacement Power Factor, the ratio between apparent and active powers at the fundamental frequency (e.g. 60 Hz).',
    ),
);

export type PowerFactor = v.InferOutput<typeof powerFactorSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parsePowerFactorXmlObject(xmlObject: any): PowerFactor {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const displacement = safeParseIntString(
        assertString(xmlObject['displacement'][0]),
    );
    const multiplier = safeParseIntString(
        assertString(xmlObject['multiplier'][0]),
    );
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        displacement,
        multiplier,
    };
}
