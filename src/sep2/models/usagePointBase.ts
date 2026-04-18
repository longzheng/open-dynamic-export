import * as v from 'valibot';
import { stringHexToEnumType } from '../../helpers/enum.js';
import { assertString } from '../helpers/assert.js';
import {
    identifiedObjectSchema,
    parseIdentifiedObjectXmlObject,
} from './identifiedObject.js';
import { roleFlagsTypeSchema, type RoleFlagsType } from './roleFlagsType.js';
import { serviceKindSchema } from './serviceKind.js';
import { usagePointBaseStatusSchema } from './usagePointBaseStatus.js';

export const usagePointBaseSchema = v.intersect([
    v.object({
        roleFlags: roleFlagsTypeSchema,
        serviceCategoryKind: serviceKindSchema,
        status: usagePointBaseStatusSchema,
    }),
    identifiedObjectSchema,
]);

export type UsagePointBase = v.InferOutput<typeof usagePointBaseSchema>;

export function parseUsagePointBaseXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): UsagePointBase {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const roleFlags = stringHexToEnumType<RoleFlagsType>(
        assertString(xmlObject['roleFlags'][0]),
    );
    const serviceCategoryKind = v.parse(
        serviceKindSchema,
        assertString(xmlObject['serviceCategoryKind'][0]),
    );

    const status = v.parse(
        usagePointBaseStatusSchema,
        assertString(xmlObject['status'][0]),
    );
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...identifiedObject,
        roleFlags,
        serviceCategoryKind,
        status,
    };
}
