import { safeParseIntString } from '../number';
import { assertString } from './assert';
import { parseLinkXmlObject, type Link } from './link';

export type FunctionSetAssignments = {
    link: Link;
    derProgramListLink: Link;
    responseSetListLink: Link;
    timeLink: Link;
    mRID: string;
    description: string;
    version: number;
};

export function parseFunctionSetAssignmentsXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): FunctionSetAssignments {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const link = parseLinkXmlObject(xmlObject);
    const derProgramListLink = parseLinkXmlObject(
        xmlObject['DERProgramListLink'][0],
    );
    const responseSetListLink = parseLinkXmlObject(
        xmlObject['ResponseSetListLink'][0],
    );
    const timeLink = parseLinkXmlObject(xmlObject['TimeLink'][0]);
    const mRID = assertString(xmlObject['mRID'][0]);
    const description = assertString(xmlObject['description'][0]);
    const version = safeParseIntString(assertString(xmlObject['version'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return {
        link,
        derProgramListLink,
        responseSetListLink,
        timeLink,
        mRID,
        description,
        version,
    };
}
