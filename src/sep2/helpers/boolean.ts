export function booleanToString(value: boolean): string {
    switch (value) {
        case false:
            return '0';
        case true:
            return '1';
    }
}

// https://www.oreilly.com/library/view/xml-schema/0596002521/re58.html
// The value space of xs:boolean is “true” and “false,” and its lexical space accepts true, false, and also “1” (for true) and “0” (for false).
export function stringToBoolean(value: string): boolean {
    switch (value) {
        case 'false':
        case '0':
            return false;
        case 'true':
        case '1':
            return true;
        default:
            throw new Error(`Invalid boolean string: ${value}`);
    }
}
