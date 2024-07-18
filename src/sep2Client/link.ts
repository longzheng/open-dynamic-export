import { assertIsString } from '../assert';

export type Link = {
    href: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseLinkXml(xmlObject: any): Link {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const linkHref = xmlObject['$']['href'];
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    assertIsString(linkHref);

    return {
        href: linkHref,
    };
}
