import { assertString } from './assert';
import { parseLinkXmlObject, type Link } from './link';
import { safeParseIntString } from '../number';

export type DERProgram = {
    link: Link;
    mRID: string;
    description: string;
    version: number;
    defaultDERControlLink?: Link;
    derControlListLink: Link;
    derCurveListLink: Link;
    primacy: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERProgramXmlObject(xmlObject: any): DERProgram {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const link = parseLinkXmlObject(xmlObject);
    const mRID = assertString(xmlObject['mRID'][0]);
    const description = assertString(xmlObject['description'][0]);
    const version = safeParseIntString(assertString(xmlObject['version'][0]));
    const defaultDERControlLink = xmlObject['DefaultDERControlLink']
        ? parseLinkXmlObject(xmlObject['DefaultDERControlLink'][0])
        : undefined;
    const derControlListLink = parseLinkXmlObject(
        xmlObject['DERControlListLink'][0],
    );
    const derCurveListLink = parseLinkXmlObject(
        xmlObject['DERCurveListLink'][0],
    );
    const primacy = safeParseIntString(assertString(xmlObject['primacy'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        link,
        mRID,
        description,
        version,
        defaultDERControlLink,
        derControlListLink,
        derCurveListLink,
        primacy,
    };
}
