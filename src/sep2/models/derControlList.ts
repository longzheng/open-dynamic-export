import { assertArray, assertString } from '../helpers/assert';
import { stringIntToBoolean } from '../helpers/boolean';
import { parseDERControlXmlObject, type DERControl } from './derControl';
import { parseListXmlObject, type List } from './list';

export type DERControlList = {
    list: List;
    subscribable: boolean;
    derControls: DERControl[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerControlListXml(xml: any): DERControlList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['DERControlList']);
    const subscribable = stringIntToBoolean(
        assertString(xml['DERControlList']['$']['subscribable']),
    );
    const derControlArray = assertArray(xml['DERControlList']['DERControl']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const derControls = derControlArray.map((derControlXml) =>
        parseDERControlXmlObject(derControlXml),
    );

    return {
        list,
        subscribable,
        derControls,
    };
}
