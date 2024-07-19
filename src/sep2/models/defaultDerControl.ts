import { safeParseIntString } from '../../number';
import { assertString } from '../helpers/assert';
import {
    parseDERControlBaseXmlObject,
    type DERControlBase,
} from './derControlBase';

export type RampRate =
    | { type: 'noLimit' }
    | {
          type: 'limited';
          percent: number;
      };

export type DefaultDERControl = {
    mRID: string;
    version: number;
    derControlBase: DERControlBase;
    setGradW?: RampRate;
    setSoftGradW?: RampRate;
};

export function parseDefaultDERControlXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): DefaultDERControl {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const mRID = assertString(xml['DefaultDERControl']['mRID'][0]);
    const version = safeParseIntString(
        assertString(xml['DefaultDERControl']['version'][0]),
    );
    const derControlBase = parseDERControlBaseXmlObject(
        xml['DefaultDERControl']['DERControlBase'][0],
    );
    const setGradW = parseRampRateXmlObject(
        xml['DefaultDERControl']['setGradW'],
    );
    const setSoftGradW = parseRampRateXmlObject(
        xml['DefaultDERControl']['setSoftGradW'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        mRID,
        version,
        derControlBase,
        setGradW,
        setSoftGradW,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRampRateXmlObject(xmlObject: any): RampRate | undefined {
    if (!xmlObject) {
        return undefined;
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const percent = safeParseIntString(assertString(xmlObject[0]));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    if (percent === 0) {
        return { type: 'noLimit' };
    }

    return {
        type: 'limited',
        percent,
    };
}
