import { assertArray } from '../helpers/assert';
import { parseDERControlXmlObject, type DERControl } from './derControl';
import {
    parseSubscribableListXmlObject,
    type SubscribableList,
} from './subscribableList';

export type DERControlList = {
    derControls: DERControl[];
} & SubscribableList;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerControlListXml(xml: any): DERControlList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['DERControlList'],
    );
    const derControlArray = assertArray(xml['DERControlList']['DERControl']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const derControls = derControlArray.map((derControlXml) =>
        parseDERControlXmlObject(derControlXml),
    );

    return {
        ...subscribableList,
        derControls,
    };
}
