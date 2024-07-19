// 0 = Not Applicable (default, if not specified)
// 32 = Phase C (and S2)
// 33 = Phase CN (and S2N)
// 40 = Phase CA
// 64 = Phase B
// 65 = Phase BN
// 66 = Phase BC
// 128 = Phase A (and S1)
// 129 = Phase AN (and S1N)
// 132 = Phase AB
// 224 = Phase ABC
// All other values reserved.
export enum PhaseCode {
    NotApplicable = '0',
    PhaseC = '32',
    PhaseCN = '33',
    PhaseCA = '40',
    PhaseB = '64',
    PhaseBN = '65',
    PhaseBC = '66',
    PhaseA = '128',
    PhaseAN = '129',
    PhaseAB = '132',
    PhaseABC = '224',
}
