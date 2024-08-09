import { safeParseIntString } from '../../number';
import { assertString } from '../helpers/assert';
import {
    parseDERControlBaseXmlObject,
    type DERControlBase,
} from './derControlBase';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource';

export type RampRate =
    | { type: 'noLimit' }
    | {
          type: 'limited';
          percent: number;
      };

export type DefaultDERControl = {
    derControlBase: DERControlBase;
    // Set default rate of change (ramp rate) of active power output due to command or internal action, defined in %setWMax / second. Resolution is in hundredths of a percent/second. A value of 0 means there is no limit. Interpreted as a percentage change in output capability limit per second when used as a default ramp rate. When present, this value SHALL update the value of the corresponding setting (DERSettings::setGradW).
    setGradW: RampRate | undefined;
    // Set soft-start rate of change (soft-start ramp rate) of active power output due to command or internal action, defined in %setWMax / second. Resolution is in hundredths of a percent/second. A value of 0 means there is no limit. Interpreted as a percentage change in output capability limit per second when used as a ramp rate. When present, this value SHALL update the value of the corresponding setting (DERSettings::setSoftGradW).
    setSoftGradW: RampRate | undefined;
} & IdentifiedObject &
    SubscribableResource;

export function parseDefaultDERControlXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): DefaultDERControl {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const subscribableResource = parseSubscribableResourceXmlObject(
        xml['DefaultDERControl'],
    );
    const identifiedObject = parseIdentifiedObjectXmlObject(
        xml['DefaultDERControl'],
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
        ...subscribableResource,
        ...identifiedObject,
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

    // A value of 0 means there is no limit.
    if (percent === 0) {
        return { type: 'noLimit' };
    }

    return {
        type: 'limited',
        percent,
    };
}
