import { stringHexToEnumType } from '../../helpers/enum.js';
import { assertString } from '../helpers/assert.js';
import {
    identifiedObjectSchema,
    parseIdentifiedObjectXmlObject,
} from './identifiedObject.js';
import { roleFlagsTypeSchema, type RoleFlagsType } from './roleFlagsType.js';
import { serviceKindSchema } from './serviceKind.js';
import { z } from 'zod';
import { usagePointBaseStatusSchema } from './usagePointBaseStatus.js';
export const usagePointBaseSchema = z
    .object({
        roleFlags: roleFlagsTypeSchema,
        serviceCategoryKind: serviceKindSchema,
        status: usagePointBaseStatusSchema,
    })
    .merge(identifiedObjectSchema);

export type UsagePointBase = z.infer<typeof usagePointBaseSchema>;

export function parseUsagePointBaseXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): UsagePointBase {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const roleFlags = stringHexToEnumType<RoleFlagsType>(
        assertString(xmlObject['roleFlags'][0]),
    );
    const serviceCategoryKind = serviceKindSchema.parse(
        assertString(xmlObject['serviceCategoryKind'][0]),
    );

    const status = usagePointBaseStatusSchema.parse(
        assertString(xmlObject['status'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...identifiedObject,
        roleFlags,
        serviceCategoryKind,
        status,
    };
}
