// 0 = Not Applicable (default, if not specified)
// 2 = Average
// 8 = Maximum
// 9 = Minimum
// 12 = Normal
// 29 = Standard Deviation of a Population (typically indicated by a lower case sigma)
// 30 = Standard Deviation of a Sample Drawn from a Population (typically indicated by a lower case 's')
// All other values reserved.
export enum DataQualifierType {
    NotApplicable = '0',
    Average = '2',
    Maximum = '8',
    Minimum = '9',
    Normal = '12',
    PopulationStandardDeviation = '29',
    SampleStandardDeviation = '30',
}
