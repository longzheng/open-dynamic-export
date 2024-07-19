// 0 = Not Applicable (default, if not specified)
// 1 = Forward (delivered to customer)
// 19 = Reverse (received from customer)
// All other values reserved.
export enum FlowDirectionType {
    NotApplicable = '0',
    Forward = '1',
    Reverse = '19',
}
