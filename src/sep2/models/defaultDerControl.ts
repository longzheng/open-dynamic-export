import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import {
    derControlBaseSchema,
    parseDERControlBaseXmlObject,
} from './derControlBase.js';
import {
    identifiedObjectSchema,
    parseIdentifiedObjectXmlObject,
} from './identifiedObject.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';

export const defaultDERControlSchema = v.intersect([
    v.object({
        derControlBase: derControlBaseSchema,
        setGradW: v.pipe(
            v.optional(v.number()),
            v.description(
                'Set default rate of change (ramp rate) of active power output due to command or internal action, defined in %setWMax / second. Resolution is in hundredths of a percent/second. A value of 0 means there is no limit. Interpreted as a percentage change in output capability limit per second when used as a default ramp rate. When present, this value SHALL update the value of the corresponding setting (DERSettings::setGradW).',
            ),
        ),
        setSoftGradW: v.pipe(
            v.optional(v.number()),
            v.description(
                'Set soft-start rate of change (soft-start ramp rate) of active power output due to command or internal action, defined in %setWMax / second. Resolution is in hundredths of a percent/second. A value of 0 means there is no limit. Interpreted as a percentage change in output capability limit per second when used as a ramp rate. When present, this value SHALL update the value of the corresponding setting (DERSettings::setSoftGradW).',
            ),
        ),
    }),
    identifiedObjectSchema,
    subscribableResourceSchema,
]);

export type DefaultDERControl = v.InferOutput<typeof defaultDERControlSchema>;

export function parseDefaultDERControlXml(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): DefaultDERControl {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableResource = parseSubscribableResourceXmlObject(
        xml['DefaultDERControl'],
    );
    const identifiedObject = parseIdentifiedObjectXmlObject(
        xml['DefaultDERControl'],
    );
    const derControlBase = parseDERControlBaseXmlObject(
        xml['DefaultDERControl']['DERControlBase'][0],
    );
    const setGradW = xml['DefaultDERControl']['setGradW']
        ? safeParseIntString(
              assertString(xml['DefaultDERControl']['setGradW'][0]),
          )
        : undefined;
    const setSoftGradW = xml['DefaultDERControl']['setSoftGradW']
        ? safeParseIntString(
              assertString(xml['DefaultDERControl']['setSoftGradW'][0]),
          )
        : undefined;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribableResource,
        ...identifiedObject,
        derControlBase,
        setGradW,
        setSoftGradW,
    };
}
