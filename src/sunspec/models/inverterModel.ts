import type { SunSpecBrand } from './brand';
import { froniusInverterModel } from './fronius/inverterModel';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type InverterModel = {
    // Model identifier
    // Well-known value. Uniquely identifies this as a sunspec model inverter monitoring
    // 101 is single phase, 102 is split phase, 103 is three phase
    ID: number;
    // Model length
    L: number;
    // AC Current
    A: number;
    // Phase A Current
    AphA: number;
    // Phase B Current
    AphB: number;
    // Phase C Current
    AphC: number;
    A_SF: number;
    // Phase Voltage AB
    PPVphAB: number;
    // Phase Voltage BC
    PPVphBC: number;
    // Phase Voltage CA
    PPVphCA: number;
    // Phase Voltage AN
    PhVphA: number;
    // Phase Voltage BN
    PhVphB: number;
    // Phase Voltage CN
    PhVphC: number;
    V_SF: number;
    // AC Power
    W: number;
    W_SF: number;
    // Line Frequency
    Hz: number;
    Hz_SF: number;
    // AC Apparent Power
    VA: number;
    VA_SF: number;
    // AC Reactive Power
    VAr: number;
    VAr_SF: number;
    // AC Power Factor
    PF: number;
    PF_SF: number;
    // AC Energy
    WH: number;
    WH_SF: number;
    // DC Amps
    DCA: number;
    DCA_SF: number;
    // DC Voltage
    DCV: number;
    DCV_SF: number;
    // DC Power
    DCW: number;
    DCW_SF: number;
    // Cabinet Temperature
    TmpCab: number;
    // Heat Sink Temperature
    TmpSnk: number;
    // Transformer Temperature
    TmpTrns: number;
    // Other Temperature
    TmpOt: number;
    Tmp_SF: number;
    // Operating State
    St: InverterState;
    // Vendor Operating State
    StVnd: number;
    // Event1
    Evt1: InverterEvent1;
    // Event Bitfield 2
    Evt2: number;
    // Vendor Event Bitfield 1
    EvtVnd1: number;
    // Vendor Event Bitfield 2
    EvtVnd2: number;
    // Vendor Event Bitfield 3
    EvtVnd3: number;
    // Vendor Event Bitfield 4
    EvtVnd4: number;
};

export function getInverterModelByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return froniusInverterModel;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}

export enum InverterState {
    // Off
    I_STATUS_OFF = 1,
    // Sleeping (auto-shutdown)
    I_STATUS_SLEEPING = 2,
    // Starting up
    I_STATUS_STARTING = 3,
    // Tracking power point
    I_STATUS_MPPT = 4,
    // Forced power reduction
    I_STATUS_THROTTLED = 5,
    // Shutting down
    I_STATUS_SHUTTING_DOWN = 6,
    // One or more faults exist
    I_STATUS_FAULT = 7,
    // Standby (service on unit)* might be in Events
    I_STATUS_STANDBY = 8,
}

// SunSpec_Information_Model_Reference_20210302.xlsx
// GROUND_FAULT	0
// DC_OVER_VOLT	1
// AC_DISCONNECT	2
// DC_DISCONNECT	3
// GRID_DISCONNECT	4
// CABINET_OPEN	5
// MANUAL_SHUTDOWN	6
// OVER_TEMP	7
// OVER_FREQUENCY	8
// UNDER_FREQUENCY	9
// AC_OVER_VOLT	10
// AC_UNDER_VOLT	11
// BLOWN_STRING_FUSE	12
// UNDER_TEMP	13
// MEMORY_LOSS	14
// HW_TEST_FAILURE	15
export enum InverterEvent1 {
    GROUND_FAULT = 1 << 0,
    DC_OVER_VOLT = 1 << 1,
    AC_DISCONNECT = 1 << 2,
    DC_DISCONNECT = 1 << 3,
    GRID_DISCONNECT = 1 << 4,
    CABINET_OPEN = 1 << 5,
    MANUAL_SHUTDOWN = 1 << 6,
    OVER_TEMP = 1 << 7,
    OVER_FREQUENCY = 1 << 8,
    UNDER_FREQUENCY = 1 << 9,
    AC_OVER_VOLT = 1 << 10,
    AC_UNDER_VOLT = 1 << 11,
    BLOWN_STRING_FUSE = 1 << 12,
    UNDER_TEMP = 1 << 13,
    MEMORY_LOSS = 1 << 14,
    HW_TEST_FAILURE = 1 << 15,
}
