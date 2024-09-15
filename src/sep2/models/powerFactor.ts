import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

// Specifies a setpoint for Displacement Power Factor, the ratio between apparent and active powers at the fundamental frequency (e.g. 60 Hz).
export type PowerFactor = {
    displacement: number;
    // power of ten multiplier
    multiplier: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parsePowerFactorXmlObject(xmlObject: any): PowerFactor {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const displacement = safeParseIntString(
        assertString(xmlObject['displacement'][0]),
    );
    const multiplier = safeParseIntString(
        assertString(xmlObject['multiplier'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        displacement,
        multiplier,
    };
}
