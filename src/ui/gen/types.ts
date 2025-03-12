export const commonModelId = {
    "1": 1
} as const;
export type CommonModelId = (typeof commonModelId)[keyof typeof commonModelId];
/**
 * @description Common\n\nAll SunSpec compliant devices must include this as the first model
*/
export type CommonModel = {
    /**
     * @description Device Address\n\nModbus device address\n\nThis point is mandatory for all SunSpec RTU devices and, for those devices, they must support values from 1-247.
     * @type number, double
    */
    DA: number | null;
    /**
     * @description Serial Number\n\nManufacturer specific value (32 chars)
     * @type string
    */
    SN: string;
    /**
     * @description Version\n\nManufacturer specific value (16 chars)
     * @type string
    */
    Vr: string | null;
    /**
     * @description Options\n\nManufacturer specific value (16 chars)
     * @type string
    */
    Opt: string | null;
    /**
     * @description Model\n\nManufacturer specific value (32 chars)
     * @type string
    */
    Md: string;
    /**
     * @description Manufacturer\n\nWell known value registered with SunSpec for compliance
     * @type string
    */
    Mn: string;
    /**
     * @description Model Length\n\nModel length
     * @type number, double
    */
    L: number;
    /**
     * @description Model ID\n\nModel identifier
     * @type number
    */
    ID: CommonModelId;
};

 export const meterEvent = {
    "4": 4,
    "8": 8,
    "16": 16,
    "32": 32,
    "64": 64,
    "128": 128,
    "65536": 65536,
    "131072": 131072,
    "262144": 262144,
    "524288": 524288,
    "1048576": 1048576,
    "2097152": 2097152,
    "4194304": 4194304,
    "8388608": 8388608,
    "16777216": 16777216,
    "33554432": 33554432,
    "67108864": 67108864,
    "134217728": 134217728,
    "268435456": 268435456,
    "536870912": 536870912,
    "1073741824": 1073741824
} as const;
export type MeterEvent = (typeof meterEvent)[keyof typeof meterEvent];

 export const meterModelId = {
    "201": 201,
    "202": 202,
    "203": 203
} as const;
export type MeterModelId = (typeof meterModelId)[keyof typeof meterModelId];
/**
 * @description Meter (Single Phase, Split-Phase, Three Phase)\n\nA combination of the three models for single phase, split-phase, and three phase meters
*/
export type MeterModel = {
    /**
     * @type number
    */
    Evt: MeterEvent;
    /**
     * @description TotVArh_SF\n\nReactive Energy scale factor.
     * @type number, double
    */
    TotVArh_SF: number | null;
    /**
     * @description TotVArhExpQ4PhC\n\nReactive Power Exported Q4 phase C.
     * @type number, double
    */
    TotVArhExpQ4PhC: number | null;
    /**
     * @description TotVArhExpQ4PhB\n\nReactive Power Exported Q4 phase B.
     * @type number, double
    */
    TotVArhExpQ4PhB: number | null;
    /**
     * @description TotVArhExpQ4PhA\n\nReactive Power Exported Q4 phase A.
     * @type number, double
    */
    TotVArhExpQ4PhA: number | null;
    /**
     * @description TotVArhExpQ4\n\nTotal Reactive Power Exported Quadrant 4.
     * @type number, double
    */
    TotVArhExpQ4: number;
    /**
     * @description TotVArhExpQ3PhC\n\nReactive Power Exported Q3 phase C.
     * @type number, double
    */
    TotVArhExpQ3PhC: number | null;
    /**
     * @description TotVArhExpQ3PhB\n\nReactive Power Exported Q3 phase B.
     * @type number, double
    */
    TotVArhExpQ3PhB: number | null;
    /**
     * @description TotVArhExpQ3PhA\n\nReactive Power Exported Q3 phase A.
     * @type number, double
    */
    TotVArhExpQ3PhA: number | null;
    /**
     * @description TotVArhExpQ3\n\nTotal Reactive Power Exported Quadrant 3.
     * @type number, double
    */
    TotVArhExpQ3: number;
    /**
     * @description TotVArhImpQ2PhC\n\nReactive Power Imported Q2 phase C.
     * @type number, double
    */
    TotVArhImpQ2PhC: number | null;
    /**
     * @description TotVArhImpQ2PhB\n\nReactive Power Imported Q2 phase B.
     * @type number, double
    */
    TotVArhImpQ2PhB: number | null;
    /**
     * @description TotVArhImpQ2PhA\n\nReactive Power Imported Q2 phase A.
     * @type number, double
    */
    TotVArhImpQ2PhA: number | null;
    /**
     * @description TotVArhImpQ2\n\nTotal Reactive Power Imported Quadrant 2.
     * @type number, double
    */
    TotVArhImpQ2: number;
    /**
     * @description TotVArhImpQ1PhC\n\nReactive Energy Imported Q1 phase C.
     * @type number, double
    */
    TotVArhImpQ1PhC: number | null;
    /**
     * @description TotVArhImpQ1PhB\n\nReactive Energy Imported Q1 phase B.
     * @type number, double
    */
    TotVArhImpQ1PhB: number | null;
    /**
     * @description TotVArhImpQ1PhA\n\nReactive Energy Imported Q1 phase A.
     * @type number, double
    */
    TotVArhImpQ1PhA: number | null;
    /**
     * @description TotVArhImpQ1\n\nTotal Reactive Energy Imported Quadrant 1.
     * @type number, double
    */
    TotVArhImpQ1: number;
    /**
     * @description TotVAh_SF\n\nApparent Energy scale factor.
     * @type number, double
    */
    TotVAh_SF: number | null;
    /**
     * @description TotVAhImpPhC\n\nApparent Energy Imported phase C.
     * @type number, double
    */
    TotVAhImpPhC: number | null;
    /**
     * @description TotVAhImpPhB\n\nApparent Energy Imported phase B.
     * @type number, double
    */
    TotVAhImpPhB: number | null;
    /**
     * @description TotVAhImpPhA\n\nApparent Energy Imported phase A.
     * @type number, double
    */
    TotVAhImpPhA: number | null;
    /**
     * @description TotVAhImp\n\nTotal Apparent Energy Imported.
     * @type number, double
    */
    TotVAhImp: number;
    /**
     * @description TotVAhExpPhC\n\nApparent Energy Exported phase C.
     * @type number, double
    */
    TotVAhExpPhC: number | null;
    /**
     * @description TotVAhExpPhB\n\nApparent Energy Exported phase B.
     * @type number, double
    */
    TotVAhExpPhB: number | null;
    /**
     * @description TotVAhExpPhA\n\nApparent Energy Exported phase A.
     * @type number, double
    */
    TotVAhExpPhA: number | null;
    /**
     * @description TotVAhExp\n\nTotal Apparent Energy Exported.
     * @type number, double
    */
    TotVAhExp: number;
    /**
     * @description TotWh_SF\n\nReal Energy scale factor.
     * @type number, double
    */
    TotWh_SF: number;
    /**
     * @description TotWhImpPhC\n\nReal Energy Imported phase C.
     * @type number, double
    */
    TotWhImpPhC: number | null;
    /**
     * @description TotWhImpPhB\n\nReal Energy Imported phase B.
     * @type number, double
    */
    TotWhImpPhB: number | null;
    /**
     * @description TotWhImpPhA\n\nReal Energy Imported phase A.
     * @type number, double
    */
    TotWhImpPhA: number | null;
    /**
     * @description TotWhImp\n\nTotal Real Energy Imported.
     * @type number, double
    */
    TotWhImp: number;
    /**
     * @description TotWhExpPhC\n\nReal Energy Exported phase C.
     * @type number, double
    */
    TotWhExpPhC: number | null;
    /**
     * @description TotWhExpPhB\n\nReal Energy Exported phase B.
     * @type number, double
    */
    TotWhExpPhB: number | null;
    /**
     * @description TotWhExpPhA\n\nReal Energy Exported phase A.
     * @type number, double
    */
    TotWhExpPhA: number | null;
    /**
     * @description TotWhExp\n\nTotal Real Energy Exported.
     * @type number, double
    */
    TotWhExp: number;
    /**
     * @description PF_SF\n\nPower Factor scale factor.
     * @type number, double
    */
    PF_SF: number | null;
    /**
     * @description PFphC\n\nPower Factor phase C.
     * @type number, double
    */
    PFphC: number | null;
    /**
     * @description PFphB\n\nPower Factor phase B.
     * @type number, double
    */
    PFphB: number | null;
    /**
     * @description PFphA\n\nPower Factor phase A.
     * @type number, double
    */
    PFphA: number | null;
    /**
     * @description PF\n\nPower Factor.
     * @type number, double
    */
    PF: number | null;
    /**
     * @description VAR_SF\n\nReactive Power scale factor.
     * @type number, double
    */
    VAR_SF: number | null;
    /**
     * @description VARphC\n\nReactive Power phase C.
     * @type number, double
    */
    VARphC: number | null;
    /**
     * @description VARphB\n\nReactive Power phase B.
     * @type number, double
    */
    VARphB: number | null;
    /**
     * @description VARphA\n\nReactive Power phase A.
     * @type number, double
    */
    VARphA: number | null;
    /**
     * @description VAR\n\nReactive Power.
     * @type number, double
    */
    VAR: number | null;
    /**
     * @description VA_SF\n\nApparent Power scale factor.
     * @type number, double
    */
    VA_SF: number | null;
    /**
     * @description VAphC\n\nApparent Power phase C.
     * @type number, double
    */
    VAphC: number | null;
    /**
     * @description VAphB\n\nApparent Power phase B.
     * @type number, double
    */
    VAphB: number | null;
    /**
     * @description VAphA\n\nApparent Power phase A.
     * @type number, double
    */
    VAphA: number | null;
    /**
     * @description VA\n\nAC Apparent Power.
     * @type number, double
    */
    VA: number | null;
    /**
     * @description W_SF\n\nReal Power scale factor.
     * @type number, double
    */
    W_SF: number;
    /**
     * @description WphC\n\nReal Power phase C.
     * @type number, double
    */
    WphC: number | null;
    /**
     * @description WphB\n\nReal Power phase B.
     * @type number, double
    */
    WphB: number | null;
    /**
     * @description WphA\n\nReal Power phase A.
     * @type number, double
    */
    WphA: number | null;
    /**
     * @description W\n\nTotal Real Power.
     * @type number, double
    */
    W: number;
    /**
     * @description Hz_SF\n\nFrequency scale factor.
     * @type number, double
    */
    Hz_SF: number;
    /**
     * @description Hz\n\nFrequency.
     * @type number, double
    */
    Hz: number;
    /**
     * @description V_SF\n\nVoltage scale factor.
     * @type number, double
    */
    V_SF: number;
    /**
     * @description PPVphCA\n\nPhase Voltage CA.
     * @type number, double
    */
    PPVphCA: number | null;
    /**
     * @description PPVphBC\n\nPhase Voltage BC.
     * @type number, double
    */
    PPVphBC: number | null;
    /**
     * @description PPVphAB\n\nPhase Voltage AB.
     * @type number, double
    */
    PPVphAB: number | null;
    /**
     * @description PPV\n\nLine to Line AC Voltage (average of active phases).
     * @type number, double
    */
    PPV: number | null;
    /**
     * @description PhVphC\n\nPhase Voltage CN.
     * @type number, double
    */
    PhVphC: number | null;
    /**
     * @description PhVphB\n\nPhase Voltage BN.
     * @type number, double
    */
    PhVphB: number | null;
    /**
     * @description PhVphA\n\nPhase Voltage AN.
     * @type number, double
    */
    PhVphA: number | null;
    /**
     * @description PhV\n\nLine to Neutral AC Voltage (average of active phases).
     * @type number, double
    */
    PhV: number | null;
    /**
     * @description A_SF\n\nCurrent scale factor.
     * @type number, double
    */
    A_SF: number;
    /**
     * @description AphC\n\nPhase C Current.
     * @type number, double
    */
    AphC: number | null;
    /**
     * @description AphB\n\nPhase B Current.
     * @type number, double
    */
    AphB: number | null;
    /**
     * @description AphA\n\nPhase A Current.
     * @type number, double
    */
    AphA: number | null;
    /**
     * @description A\n\nTotal AC Current.
     * @type number, double
    */
    A: number;
    /**
     * @description Model Length\n\nModel length.
     * @type number, double
    */
    L: number;
    /**
     * @description Model ID\n\nModel identifier.
     * @type number
    */
    ID: MeterModelId;
};

 export const inverterState = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8
} as const;
export type InverterState = (typeof inverterState)[keyof typeof inverterState];

 export const inverterEvent1 = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8,
    "16": 16,
    "32": 32,
    "64": 64,
    "128": 128,
    "256": 256,
    "512": 512,
    "1024": 1024,
    "2048": 2048,
    "4096": 4096,
    "8192": 8192,
    "16384": 16384,
    "32768": 32768
} as const;
export type InverterEvent1 = (typeof inverterEvent1)[keyof typeof inverterEvent1];

 export const inverterModelId = {
    "101": 101,
    "102": 102,
    "103": 103
} as const;
export type InverterModelId = (typeof inverterModelId)[keyof typeof inverterModelId];
/**
 * @description Inverter (Single Phase, Split-Phase, Three Phase)\n\nA combination of the three models for single phase, split-phase, and three phase inverters
*/
export type InverterModel = {
    /**
     * @description Vendor Event Bitfield 4\n\nVendor defined events
     * @type number, double
    */
    EvtVnd4: number | null;
    /**
     * @description Vendor Event Bitfield 3\n\nVendor defined events
     * @type number, double
    */
    EvtVnd3: number | null;
    /**
     * @description Vendor Event Bitfield 2\n\nVendor defined events
     * @type number, double
    */
    EvtVnd2: number | null;
    /**
     * @description Vendor Event Bitfield 1\n\nVendor defined events
     * @type number, double
    */
    EvtVnd1: number | null;
    /**
     * @description Event Bitfield 2\n\nReserved for future use
     * @type number, double
    */
    Evt2: number;
    /**
     * @type number
    */
    Evt1: InverterEvent1;
    /**
     * @description Vendor Operating State\n\nVendor specific operating state code
     * @type number, double
    */
    StVnd: number | null;
    /**
     * @type number
    */
    St: InverterState;
    /**
     * @description Scale Factor for Temperature
     * @type number, double
    */
    Tmp_SF: number | null;
    /**
     * @description Other Temperature\n\nOther Temperature
     * @type number, double
    */
    TmpOt: number | null;
    /**
     * @description Transformer Temperature\n\nTransformer Temperature
     * @type number, double
    */
    TmpTrns: number | null;
    /**
     * @description Heat Sink Temperature\n\nHeat Sink Temperature
     * @type number, double
    */
    TmpSnk: number | null;
    /**
     * @description Cabinet Temperature\n\nCabinet Temperature
     * @type number, double
    */
    TmpCab: number | null;
    /**
     * @description Scale Factor for DC Power
     * @type number, double
    */
    DCW_SF: number | null;
    /**
     * @description DC Watts\n\nDC Power
     * @type number, double
    */
    DCW: number | null;
    /**
     * @description Scale Factor for DC Voltage
     * @type number, double
    */
    DCV_SF: number | null;
    /**
     * @description DC Voltage\n\nDC Voltage
     * @type number, double
    */
    DCV: number | null;
    /**
     * @description Scale Factor for DC Current
     * @type number, double
    */
    DCA_SF: number | null;
    /**
     * @description DC Amps\n\nDC Current
     * @type number, double
    */
    DCA: number | null;
    /**
     * @description Scale Factor for Energy
     * @type number, double
    */
    WH_SF: number;
    /**
     * @description AC Energy\n\nAC Energy
     * @type number, double
    */
    WH: number;
    /**
     * @description Scale Factor for Power Factor
     * @type number, double
    */
    PF_SF: number | null;
    /**
     * @description AC Power Factor\n\nAC Power Factor
     * @type number, double
    */
    PF: number | null;
    /**
     * @description Scale Factor for Reactive Power
     * @type number, double
    */
    VAr_SF: number | null;
    /**
     * @description AC Reactive Power\n\nAC Reactive Power
     * @type number, double
    */
    VAr: number | null;
    /**
     * @description Scale Factor for Apparent Power
     * @type number, double
    */
    VA_SF: number | null;
    /**
     * @description AC Apparent Power\n\nAC Apparent Power
     * @type number, double
    */
    VA: number | null;
    /**
     * @description Scale Factor for Frequency
     * @type number, double
    */
    Hz_SF: number;
    /**
     * @description Line Frequency\n\nLine Frequency
     * @type number, double
    */
    Hz: number;
    /**
     * @description Scale Factor for Power
     * @type number, double
    */
    W_SF: number;
    /**
     * @description AC Power\n\nAC Power
     * @type number, double
    */
    W: number;
    /**
     * @description Scale Factor for Voltage
     * @type number, double
    */
    V_SF: number;
    /**
     * @description Phase Voltage CN\n\nPhase Voltage CN
     * @type number, double
    */
    PhVphC: number | null;
    /**
     * @description Phase Voltage BN\n\nPhase Voltage BN
     * @type number, double
    */
    PhVphB: number | null;
    /**
     * @description Phase Voltage AN\n\nPhase Voltage AN
     * @type number, double
    */
    PhVphA: number;
    /**
     * @description Phase Voltage CA\n\nPhase Voltage CA
     * @type number, double
    */
    PPVphCA: number | null;
    /**
     * @description Phase Voltage BC\n\nPhase Voltage BC
     * @type number, double
    */
    PPVphBC: number | null;
    /**
     * @description Phase Voltage AB\n\nPhase Voltage AB
     * @type number, double
    */
    PPVphAB: number | null;
    /**
     * @description Scale Factor for Current
     * @type number, double
    */
    A_SF: number;
    /**
     * @description Phase C Current\n\nPhase C Current
     * @type number, double
    */
    AphC: number | null;
    /**
     * @description Phase B Current\n\nPhase B Current
     * @type number, double
    */
    AphB: number | null;
    /**
     * @description Phase A Current\n\nPhase A Current
     * @type number, double
    */
    AphA: number;
    /**
     * @description AC Current\n\nAC Current
     * @type number, double
    */
    A: number;
    /**
     * @description Model Length\n\nModel length
     * @type number, double
    */
    L: number;
    /**
     * @description Model ID\n\nModel identifier
     * @type number
    */
    ID: InverterModelId;
};

 export const derTyp = {
    "4": 4,
    "82": 82
} as const;
export type DerTyp = (typeof derTyp)[keyof typeof derTyp];

 export const nameplateModelId = {
    "120": 120
} as const;
export type NameplateModelId = (typeof nameplateModelId)[keyof typeof nameplateModelId];
/**
 * @description Nameplate\n\nInverter Controls Nameplate Ratings
*/
export type NameplateModel = {
    /**
     * @description MaxDisChaRte_SF\n\nScale factor
     * @type number, double
    */
    MaxDisChaRte_SF: number | null;
    /**
     * @description MaxDisChaRte\n\nMaximum rate of energy transfer out of the storage device.
     * @type number, double
    */
    MaxDisChaRte: number | null;
    /**
     * @description MaxChaRte_SF\n\nScale factor
     * @type number, double
    */
    MaxChaRte_SF: number | null;
    /**
     * @description MaxChaRte\n\nMaximum rate of energy transfer into the storage device.
     * @type number, double
    */
    MaxChaRte: number | null;
    /**
     * @description AhrRtg_SF\n\nScale factor
     * @type number, double
    */
    AhrRtg_SF: number | null;
    /**
     * @description AhrRtg\n\nThe usable capacity of the battery. Maximum charge minus minimum charge from a technology capability perspective (Amp-hour capacity rating).
     * @type number, double
    */
    AhrRtg: number | null;
    /**
     * @description WHRtg_SF\n\nScale factor
     * @type number, double
    */
    WHRtg_SF: number | null;
    /**
     * @description WHRtg\n\nNominal energy rating of storage device.
     * @type number, double
    */
    WHRtg: number | null;
    /**
     * @description PFRtg_SF\n\nScale factor
     * @type number, double
    */
    PFRtg_SF: number;
    /**
     * @description PFRtgQ4\n\nMinimum power factor capability of the inverter in quadrant 4.
     * @type number, double
    */
    PFRtgQ4: number;
    /**
     * @description PFRtgQ3\n\nMinimum power factor capability of the inverter in quadrant 3.
     * @type number, double
    */
    PFRtgQ3: number | null;
    /**
     * @description PFRtgQ2\n\nMinimum power factor capability of the inverter in quadrant 2.
     * @type number, double
    */
    PFRtgQ2: number | null;
    /**
     * @description PFRtgQ1\n\nMinimum power factor capability of the inverter in quadrant 1.
     * @type number, double
    */
    PFRtgQ1: number;
    /**
     * @description ARtg_SF\n\nScale factor
     * @type number, double
    */
    ARtg_SF: number;
    /**
     * @description ARtg\n\nMaximum RMS AC current level capability of the inverter.
     * @type number, double
    */
    ARtg: number;
    /**
     * @description VArRtg_SF\n\nScale factor
     * @type number, double
    */
    VArRtg_SF: number;
    /**
     * @description VArRtgQ4\n\nContinuous VAR capability of the inverter in quadrant 4.
     * @type number, double
    */
    VArRtgQ4: number;
    /**
     * @description VArRtgQ3\n\nContinuous VAR capability of the inverter in quadrant 3.
     * @type number, double
    */
    VArRtgQ3: number | null;
    /**
     * @description VArRtgQ2\n\nContinuous VAR capability of the inverter in quadrant 2.
     * @type number, double
    */
    VArRtgQ2: number | null;
    /**
     * @description VArRtgQ1\n\nContinuous VAR capability of the inverter in quadrant 1.
     * @type number, double
    */
    VArRtgQ1: number;
    /**
     * @description VARtg_SF\n\nScale factor
     * @type number, double
    */
    VARtg_SF: number;
    /**
     * @description VARtg\n\nContinuous Volt-Ampere capability of the inverter.
     * @type number, double
    */
    VARtg: number;
    /**
     * @description WRtg_SF\n\nScale factor
     * @type number, double
    */
    WRtg_SF: number;
    /**
     * @description WRtg\n\nContinuous power output capability of the inverter.
     * @type number, double
    */
    WRtg: number;
    /**
     * @type number
    */
    DERTyp: DerTyp;
    /**
     * @description Model Length\n\nModel length
     * @type number, double
    */
    L: number;
    /**
     * @description Model ID\n\nModel identifier
     * @type number
    */
    ID: NameplateModelId;
};

 export const vArAct = {
    "1": 1,
    "2": 2
} as const;
export type VArAct = (typeof vArAct)[keyof typeof vArAct];

 export const clcTotVa = {
    "1": 1,
    "2": 2
} as const;
export type ClcTotVa = (typeof clcTotVa)[keyof typeof clcTotVa];

 export const connPh = {
    "1": 1,
    "2": 2,
    "3": 3
} as const;
export type ConnPh = (typeof connPh)[keyof typeof connPh];

 export const settingsModelId = {
    "121": 121
} as const;
export type SettingsModelId = (typeof settingsModelId)[keyof typeof settingsModelId];
/**
 * @description Settings\n\nInverter Controls Basic Settings
*/
export type SettingsModel = {
    /**
     * @description ECPNomHz_SF\n\nScale factor for nominal frequency.
     * @type number, double
    */
    ECPNomHz_SF: number | null;
    /**
     * @description MaxRmpRte_SF\n\nScale factor for maximum ramp percentage.
     * @type number, double
    */
    MaxRmpRte_SF: number | null;
    /**
     * @description PFMin_SF\n\nScale factor for minimum power factor.
     * @type number, double
    */
    PFMin_SF: number | null;
    /**
     * @description WGra_SF\n\nScale factor for default ramp rate.
     * @type number, double
    */
    WGra_SF: number | null;
    /**
     * @description VArMax_SF\n\nScale factor for reactive power.
     * @type number, double
    */
    VArMax_SF: number | null;
    /**
     * @description VAMax_SF\n\nScale factor for apparent power.
     * @type number, double
    */
    VAMax_SF: number | null;
    /**
     * @description VMinMax_SF\n\nScale factor for min/max voltages.
     * @type number, double
    */
    VMinMax_SF: number | null;
    /**
     * @description VRefOfs_SF\n\nScale factor for offset voltage.
     * @type number, double
    */
    VRefOfs_SF: number;
    /**
     * @description VRef_SF\n\nScale factor for voltage at the PCC.
     * @type number, double
    */
    VRef_SF: number;
    /**
     * @description WMax_SF\n\nScale factor for real power.
     * @type number, double
    */
    WMax_SF: number;
    /**
     * @description ConnPh\n\nIdentity of connected phase for single phase inverters. A=1 B=2 C=3.
    */
    ConnPh: ConnPh | null;
    /**
     * @description ECPNomHz\n\nSetpoint for nominal frequency at the ECP.
     * @type number, double
    */
    ECPNomHz: number | null;
    /**
     * @description MaxRmpRte\n\nSetpoint for maximum ramp rate as percentage of nominal maximum ramp rate. This setting will limit the rate that watts delivery to the grid can increase or decrease in response to intermittent PV generation.
     * @type number, double
    */
    MaxRmpRte: number | null;
    /**
     * @description ClcTotVA\n\nCalculation method for total apparent power. 1=vector 2=arithmetic.
    */
    ClcTotVA: ClcTotVa | null;
    /**
     * @description VArAct\n\nVAR action on change between charging and discharging: 1=switch 2=maintain VAR characterization.
    */
    VArAct: VArAct | null;
    /**
     * @description PFMinQ4\n\nSetpoint for minimum power factor value in quadrant 4. Default to PFRtgQ4.
     * @type number, double
    */
    PFMinQ4: number;
    /**
     * @description PFMinQ3\n\nSetpoint for minimum power factor value in quadrant 3. Default to PFRtgQ3.
     * @type number, double
    */
    PFMinQ3: number | null;
    /**
     * @description PFMinQ2\n\nSetpoint for minimum power factor value in quadrant 2. Default to PFRtgQ2.
     * @type number, double
    */
    PFMinQ2: number | null;
    /**
     * @description PFMinQ1\n\nSetpoint for minimum power factor value in quadrant 1. Default to PFRtgQ1.
     * @type number, double
    */
    PFMinQ1: number;
    /**
     * @description WGra\n\nDefault ramp rate of change of active power due to command or internal action.
     * @type number, double
    */
    WGra: number | null;
    /**
     * @description VArMaxQ4\n\nSetting for maximum reactive power in quadrant 4. Default to VArRtgQ4.
     * @type number, double
    */
    VArMaxQ4: number;
    /**
     * @description VArMaxQ3\n\nSetting for maximum reactive power in quadrant 3. Default to VArRtgQ3.
     * @type number, double
    */
    VArMaxQ3: number | null;
    /**
     * @description VArMaxQ2\n\nSetting for maximum reactive power in quadrant 2. Default to VArRtgQ2.
     * @type number, double
    */
    VArMaxQ2: number | null;
    /**
     * @description VArMaxQ1\n\nSetting for maximum reactive power in quadrant 1. Default to VArRtgQ1.
     * @type number, double
    */
    VArMaxQ1: number;
    /**
     * @description VAMax\n\nSetpoint for maximum apparent power. Default to VARtg.
     * @type number, double
    */
    VAMax: number | null;
    /**
     * @description VMin\n\nSetpoint for minimum voltage.
     * @type number, double
    */
    VMin: number | null;
    /**
     * @description VMax\n\nSetpoint for maximum voltage.
     * @type number, double
    */
    VMax: number | null;
    /**
     * @description VRefOfs\n\nOffset from PCC to inverter.
     * @type number, double
    */
    VRefOfs: number;
    /**
     * @description VRef\n\nVoltage at the PCC.
     * @type number, double
    */
    VRef: number;
    /**
     * @description WMax\n\nSetting for maximum power output. Default to WRtg.
     * @type number, double
    */
    WMax: number;
    /**
     * @description Model Length\n\nModel length
     * @type number, double
    */
    L: number;
    /**
     * @description Model ID\n\nModel identifier
     * @type number
    */
    ID: SettingsModelId;
};

 export const pvConn = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8
} as const;
export type PvConn = (typeof pvConn)[keyof typeof pvConn];

 export const storConn = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8
} as const;
export type StorConn = (typeof storConn)[keyof typeof storConn];

 export const ecpConn = {
    "0": 0,
    "1": 1
} as const;
export type EcpConn = (typeof ecpConn)[keyof typeof ecpConn];

 export const stSetLimMsk = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8,
    "16": 16,
    "32": 32,
    "64": 64,
    "128": 128,
    "256": 256,
    "512": 512,
    "1024": 1024
} as const;
export type StSetLimMsk = (typeof stSetLimMsk)[keyof typeof stSetLimMsk];

 export const stActCtl = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8,
    "16": 16,
    "32": 32,
    "64": 64,
    "128": 128,
    "256": 256,
    "512": 512,
    "1024": 1024,
    "4096": 4096,
    "8192": 8192,
    "16384": 16384
} as const;
export type StActCtl = (typeof stActCtl)[keyof typeof stActCtl];

 export const rtSt = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8
} as const;
export type RtSt = (typeof rtSt)[keyof typeof rtSt];

 export type CertificateIds = {
    /**
     * @type string
    */
    sfdi: string;
    /**
     * @type string
    */
    lfdi: string;
};

 export type DerControlBase = {
    /**
     * @type number | undefined, double
    */
    rampTms?: number;
    /**
     * @type boolean | undefined
    */
    opModConnect?: boolean;
    /**
     * @type boolean | undefined
    */
    opModEnergize?: boolean;
    /**
     * @type object | undefined
    */
    opModLoadLimW?: {
        /**
         * @type number, double
        */
        multiplier: number;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModGenLimW?: {
        /**
         * @type number, double
        */
        multiplier: number;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModExpLimW?: {
        /**
         * @type number, double
        */
        multiplier: number;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModImpLimW?: {
        /**
         * @type number, double
        */
        multiplier: number;
        /**
         * @type number, double
        */
        value: number;
    };
};

 export const responseRequiredType = {
    "1": 1,
    "2": 2,
    "4": 4
} as const;
export type ResponseRequiredType = (typeof responseRequiredType)[keyof typeof responseRequiredType];

 export type ControlSchedule = {
    /**
     * @type string | undefined
    */
    replyToHref?: string;
    /**
     * @type number
    */
    responseRequired: ResponseRequiredType;
    /**
     * @type object
    */
    derControlBase: DerControlBase;
    /**
     * @type string
    */
    mRID: string;
    /**
     * @type number | undefined, double
    */
    randomizeDuration?: number;
    /**
     * @type number | undefined, double
    */
    randomizeStart?: number;
    /**
     * @type string, date-time
    */
    endExclusive: string;
    /**
     * @type string, date-time
    */
    startInclusive: string;
};

 export type RandomizedControlSchedule = (ControlSchedule & {
    /**
     * @type string, date-time
    */
    effectiveEndExclusive: string;
    /**
     * @type string, date-time
    */
    effectiveStartInclusive: string;
});

 export const operationalModeStatusValue = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3
} as const;
export type OperationalModeStatusValue = (typeof operationalModeStatusValue)[keyof typeof operationalModeStatusValue];

 export const connectStatusValue = {
    "1": 1,
    "2": 2,
    "4": 4,
    "8": 8,
    "16": 16
} as const;
export type ConnectStatusValue = (typeof connectStatusValue)[keyof typeof connectStatusValue];

 export type InverterData = {
    /**
     * @type object
    */
    status: {
        /**
         * @type number
        */
        genConnectStatus: ConnectStatusValue;
        /**
         * @type number
        */
        operationalModeStatus: OperationalModeStatusValue;
    };
    /**
     * @type object
    */
    settings: {
        /**
         * @type number, double
        */
        maxVar: number | null;
        /**
         * @type number, double
        */
        maxVA: number | null;
        /**
         * @type number, double
        */
        maxW: number;
    };
    /**
     * @type object
    */
    nameplate: {
        /**
         * @type number, double
        */
        maxVar: number;
        /**
         * @type number, double
        */
        maxVA: number;
        /**
         * @type number, double
        */
        maxW: number;
        /**
         * @type number
        */
        type: DerTyp;
    };
    /**
     * @type object
    */
    inverter: {
        /**
         * @type number, double
        */
        frequency: number;
        /**
         * @type number, double
        */
        voltagePhaseC: number | null;
        /**
         * @type number, double
        */
        voltagePhaseB: number | null;
        /**
         * @type number, double
        */
        voltagePhaseA: number | null;
        /**
         * @type number, double
        */
        reactivePower: number;
        /**
         * @type number, double
        */
        realPower: number;
    };
    /**
     * @type string, date-time
    */
    date: string;
};

 export type Error = {
    /**
     * @type string
    */
    name: string;
    /**
     * @type string
    */
    message: string;
    /**
     * @type string | undefined
    */
    stack?: string;
};

 export const resultInverterDataSuccess = {
    "true": true
} as const;
export type ResultInverterDataSuccess = (typeof resultInverterDataSuccess)[keyof typeof resultInverterDataSuccess];
export const resultInverterDataSuccess2 = {
    "false": false
} as const;
export type ResultInverterDataSuccess2 = (typeof resultInverterDataSuccess2)[keyof typeof resultInverterDataSuccess2];
export type ResultInverterData = ({
    /**
     * @type object
    */
    value: InverterData;
    /**
     * @type boolean
    */
    success: ResultInverterDataSuccess;
} | {
    /**
     * @type object
    */
    error: Error;
    /**
     * @type boolean
    */
    success: ResultInverterDataSuccess2;
});

 export type InvertersDataCache = ResultInverterData[];

 export const voltageType = {
    "perPhase": "perPhase"
} as const;
export type VoltageType = (typeof voltageType)[keyof typeof voltageType];
export const reactivePowerType = {
    "perPhaseNet": "perPhaseNet"
} as const;
export type ReactivePowerType = (typeof reactivePowerType)[keyof typeof reactivePowerType];
export const reactivePowerType2 = {
    "noPhase": "noPhase"
} as const;
export type ReactivePowerType2 = (typeof reactivePowerType2)[keyof typeof reactivePowerType2];
export const realPowerType = {
    "perPhaseNet": "perPhaseNet"
} as const;
export type RealPowerType = (typeof realPowerType)[keyof typeof realPowerType];
export const realPowerType2 = {
    "noPhase": "noPhase"
} as const;
export type RealPowerType2 = (typeof realPowerType2)[keyof typeof realPowerType2];
export type DerSample = {
    /**
     * @type object
    */
    status: {
        /**
         * @type number, double
        */
        genConnectStatus: number;
        /**
         * @type number, double
        */
        operationalModeStatus: number;
    };
    /**
     * @type object
    */
    settings: {
        /**
         * @type number, double
        */
        setMaxVar: number | null;
        /**
         * @type number, double
        */
        setMaxVA: number | null;
        /**
         * @type number, double
        */
        setMaxW: number;
    };
    /**
     * @type object
    */
    nameplate: {
        /**
         * @type number, double
        */
        maxVar: number;
        /**
         * @type number, double
        */
        maxVA: number;
        /**
         * @type number, double
        */
        maxW: number;
        /**
         * @type number, double
        */
        type: number;
    };
    /**
     * @type number, double
    */
    frequency: number | null;
    /**
     * @type object
    */
    voltage: {
        /**
         * @type number, double
        */
        phaseC: number | null;
        /**
         * @type number, double
        */
        phaseB: number | null;
        /**
         * @type number, double
        */
        phaseA: number | null;
        /**
         * @type string
        */
        type: VoltageType;
    } | null;
    reactivePower: ({
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type number, double
        */
        phaseC: number | null;
        /**
         * @type number, double
        */
        phaseB: number | null;
        /**
         * @type number, double
        */
        phaseA: number | null;
        /**
         * @type string
        */
        type: ReactivePowerType;
    } | {
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type string
        */
        type: ReactivePowerType2;
    });
    realPower: ({
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type number, double
        */
        phaseC: number | null;
        /**
         * @type number, double
        */
        phaseB: number | null;
        /**
         * @type number, double
        */
        phaseA: number | null;
        /**
         * @type string
        */
        type: RealPowerType;
    } | {
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type string
        */
        type: RealPowerType2;
    });
    /**
     * @type string, date-time
    */
    date: string;
};

 export const voltageType2 = {
    "perPhase": "perPhase"
} as const;
export type VoltageType2 = (typeof voltageType2)[keyof typeof voltageType2];
export const reactivePowerType3 = {
    "perPhaseNet": "perPhaseNet"
} as const;
export type ReactivePowerType3 = (typeof reactivePowerType3)[keyof typeof reactivePowerType3];
export const reactivePowerType4 = {
    "noPhase": "noPhase"
} as const;
export type ReactivePowerType4 = (typeof reactivePowerType4)[keyof typeof reactivePowerType4];
export const realPowerType3 = {
    "perPhaseNet": "perPhaseNet"
} as const;
export type RealPowerType3 = (typeof realPowerType3)[keyof typeof realPowerType3];
export const realPowerType4 = {
    "noPhase": "noPhase"
} as const;
export type RealPowerType4 = (typeof realPowerType4)[keyof typeof realPowerType4];
export type SiteSample = {
    /**
     * @type number, double
    */
    frequency: number | null;
    /**
     * @type object
    */
    voltage: {
        /**
         * @type number, double
        */
        phaseC: number | null;
        /**
         * @type number, double
        */
        phaseB: number | null;
        /**
         * @type number, double
        */
        phaseA: number | null;
        /**
         * @type string
        */
        type: VoltageType2;
    };
    reactivePower: ({
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type number, double
        */
        phaseC: number | null;
        /**
         * @type number, double
        */
        phaseB: number | null;
        /**
         * @type number, double
        */
        phaseA: number | null;
        /**
         * @type string
        */
        type: ReactivePowerType3;
    } | {
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type string
        */
        type: ReactivePowerType4;
    });
    realPower: ({
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type number, double
        */
        phaseC: number | null;
        /**
         * @type number, double
        */
        phaseB: number | null;
        /**
         * @type number, double
        */
        phaseA: number | null;
        /**
         * @type string
        */
        type: RealPowerType3;
    } | {
        /**
         * @type number, double
        */
        net: number;
        /**
         * @type string
        */
        type: RealPowerType4;
    });
    /**
     * @type string, date-time
    */
    date: string;
};

 export const inverterControlTypes = {
    "fixed": "fixed",
    "mqtt": "mqtt",
    "csipAus": "csipAus",
    "twoWayTariff": "twoWayTariff",
    "negativeFeedIn": "negativeFeedIn"
} as const;
export type InverterControlTypes = (typeof inverterControlTypes)[keyof typeof inverterControlTypes];

 export type InverterControlLimit = {
    /**
     * @type number | undefined, double
    */
    opModLoadLimW?: number;
    /**
     * @type number | undefined, double
    */
    opModImpLimW?: number;
    /**
     * @type number | undefined, double
    */
    opModExpLimW?: number;
    /**
     * @type number | undefined, double
    */
    opModGenLimW?: number;
    /**
     * @type boolean | undefined
    */
    opModConnect?: boolean;
    /**
     * @type boolean | undefined
    */
    opModEnergize?: boolean;
    /**
     * @type string
    */
    source: InverterControlTypes;
};

 /**
 * @description Construct a type with a set of properties K of type T
*/
export type RecordCsipAusOrFixedOrNegativeFeedInOrTwoWayTariffOrMqttInverterControlLimitOrNull = {
    /**
     * @type object
    */
    csipAus: InverterControlLimit;
    /**
     * @type object
    */
    fixed: InverterControlLimit;
    /**
     * @type object
    */
    negativeFeedIn: InverterControlLimit;
    /**
     * @type object
    */
    twoWayTariff: InverterControlLimit;
    /**
     * @type object
    */
    mqtt: InverterControlLimit;
};

 export type ControlLimitsByLimiter = RecordCsipAusOrFixedOrNegativeFeedInOrTwoWayTariffOrMqttInverterControlLimitOrNull;

 export type ActiveInverterControlLimit = {
    /**
     * @type object | undefined
    */
    opModLoadLimW?: {
        /**
         * @type string
        */
        source: InverterControlTypes;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModImpLimW?: {
        /**
         * @type string
        */
        source: InverterControlTypes;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModExpLimW?: {
        /**
         * @type string
        */
        source: InverterControlTypes;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModGenLimW?: {
        /**
         * @type string
        */
        source: InverterControlTypes;
        /**
         * @type number, double
        */
        value: number;
    };
    /**
     * @type object | undefined
    */
    opModConnect?: {
        /**
         * @type string
        */
        source: InverterControlTypes;
        /**
         * @type boolean
        */
        value: boolean;
    };
    /**
     * @type object | undefined
    */
    opModEnergize?: {
        /**
         * @type string
        */
        source: InverterControlTypes;
        /**
         * @type boolean
        */
        value: boolean;
    };
};

 export const inverterConfigurationType = {
    "disconnect": "disconnect"
} as const;
export type InverterConfigurationType = (typeof inverterConfigurationType)[keyof typeof inverterConfigurationType];
export const inverterConfigurationType2 = {
    "limit": "limit"
} as const;
export type InverterConfigurationType2 = (typeof inverterConfigurationType2)[keyof typeof inverterConfigurationType2];
export type InverterConfiguration = ({
    /**
     * @type string
    */
    type: InverterConfigurationType;
} | {
    /**
     * @type number, double
    */
    targetSolarPowerRatio: number;
    /**
     * @type number, double
    */
    targetSolarWatts: number;
    /**
     * @type number, double
    */
    invertersCount: number;
    /**
     * @type string
    */
    type: InverterConfigurationType2;
});

 export const coordinatorResponseRunning = {
    "true": true
} as const;
export type CoordinatorResponseRunning = (typeof coordinatorResponseRunning)[keyof typeof coordinatorResponseRunning];
export const coordinatorResponseRunning2 = {
    "false": false
} as const;
export type CoordinatorResponseRunning2 = (typeof coordinatorResponseRunning2)[keyof typeof coordinatorResponseRunning2];
export type CoordinatorResponse = ({
    inverterConfiguration: InverterConfiguration | null;
    /**
     * @type object
    */
    controlLimits: {
        /**
         * @type object
        */
        activeInverterControlLimit: ActiveInverterControlLimit;
        controlLimitsByLimiter: ControlLimitsByLimiter;
    } | null;
    /**
     * @type number, double
    */
    loadWatts: number | null;
    siteSample: SiteSample | null;
    derSample: DerSample | null;
    invertersDataCache: InvertersDataCache | null;
    /**
     * @type boolean
    */
    running: CoordinatorResponseRunning;
} | {
    /**
     * @type boolean
    */
    running: CoordinatorResponseRunning2;
});

 export const inverterPhases = {
    "singlePhase": "singlePhase"
} as const;
export type InverterPhases = (typeof inverterPhases)[keyof typeof inverterPhases];
export const inverterPhases2 = {
    "splitPhase": "splitPhase"
} as const;
export type InverterPhases2 = (typeof inverterPhases2)[keyof typeof inverterPhases2];
export const inverterPhases3 = {
    "threePhase": "threePhase"
} as const;
export type InverterPhases3 = (typeof inverterPhases3)[keyof typeof inverterPhases3];
export const statusId = {
    "122": 122
} as const;
export type StatusId = (typeof statusId)[keyof typeof statusId];
export const meterPhases = {
    "singlePhase": "singlePhase"
} as const;
export type MeterPhases = (typeof meterPhases)[keyof typeof meterPhases];
export const meterPhases2 = {
    "splitPhase": "splitPhase"
} as const;
export type MeterPhases2 = (typeof meterPhases2)[keyof typeof meterPhases2];
export const meterPhases3 = {
    "threePhase": "threePhase"
} as const;
export type MeterPhases3 = (typeof meterPhases3)[keyof typeof meterPhases3];
/**
 * @description Ok
*/
export type SunspecData200 = {
    /**
     * @type array
    */
    inverterMetrics: {
        /**
         * @type object
        */
        status: {
            /**
             * @type number, double
            */
            WAval: number;
            /**
             * @type number, double
            */
            VArAval: number;
            /**
             * @type number
            */
            ECPConn: EcpConn;
            /**
             * @type number
            */
            StorConn: StorConn;
            /**
             * @type number
            */
            PVConn: PvConn;
            /**
             * @type string
            */
            ActVArhQ4: string;
            /**
             * @type string
            */
            ActVArhQ3: string;
            /**
             * @type string
            */
            ActVArhQ2: string;
            /**
             * @type string
            */
            ActVArhQ1: string;
            /**
             * @type string
            */
            ActVAh: string;
            /**
             * @type string
            */
            ActWh: string;
        };
        /**
         * @type object
        */
        settings: {
            /**
             * @type number, double
            */
            ECPNomHz: number;
            /**
             * @type number, double
            */
            MaxRmpRte: number;
            /**
             * @type number, double
            */
            PFMinQ4: number;
            /**
             * @type number, double
            */
            PFMinQ3: number;
            /**
             * @type number, double
            */
            PFMinQ2: number;
            /**
             * @type number, double
            */
            PFMinQ1: number;
            /**
             * @type number, double
            */
            WGra: number;
            /**
             * @type number, double
            */
            VArMaxQ4: number;
            /**
             * @type number, double
            */
            VArMaxQ3: number;
            /**
             * @type number, double
            */
            VArMaxQ2: number;
            /**
             * @type number, double
            */
            VArMaxQ1: number;
            /**
             * @type number, double
            */
            VAMax: number;
            /**
             * @type number, double
            */
            VMin: number;
            /**
             * @type number, double
            */
            VMax: number;
            /**
             * @type number, double
            */
            VRefOfs: number;
            /**
             * @type number, double
            */
            VRef: number;
            /**
             * @type number, double
            */
            WMax: number;
        };
        /**
         * @type object
        */
        nameplate: {
            /**
             * @type number, double
            */
            MaxDisChaRte: number;
            /**
             * @type number, double
            */
            MaxChaRte: number;
            /**
             * @type number, double
            */
            AhrRtg: number;
            /**
             * @type number, double
            */
            WHRtg: number;
            /**
             * @type number, double
            */
            PFRtgQ4: number;
            /**
             * @type number, double
            */
            PFRtgQ3: number;
            /**
             * @type number, double
            */
            PFRtgQ2: number;
            /**
             * @type number, double
            */
            PFRtgQ1: number;
            /**
             * @type number, double
            */
            ARtg: number;
            /**
             * @type number, double
            */
            VArRtgQ4: number;
            /**
             * @type number, double
            */
            VArRtgQ3: number;
            /**
             * @type number, double
            */
            VArRtgQ2: number;
            /**
             * @type number, double
            */
            VArRtgQ1: number;
            /**
             * @type number, double
            */
            VARtg: number;
            /**
             * @type number, double
            */
            WRtg: number;
            /**
             * @type number
            */
            DERTyp: DerTyp;
        };
        inverter: ({
            /**
             * @type number, double
            */
            DCW: number;
            /**
             * @type number, double
            */
            DCV: number;
            /**
             * @type number, double
            */
            DCA: number;
            /**
             * @type number, double
            */
            WH: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VAr: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            W: number;
            PhVphC: any;
            PhVphB: any;
            /**
             * @type number, double
            */
            PhVphA: number;
            PPVphCA: any;
            PPVphBC: any;
            /**
             * @type number, double
            */
            PPVphAB: number;
            AphC: any;
            AphB: any;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: InverterPhases;
        } | {
            /**
             * @type number, double
            */
            DCW: number;
            /**
             * @type number, double
            */
            DCV: number;
            /**
             * @type number, double
            */
            DCA: number;
            /**
             * @type number, double
            */
            WH: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VAr: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            W: number;
            PhVphC: any;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            PPVphCA: any;
            /**
             * @type number, double
            */
            PPVphBC: number;
            /**
             * @type number, double
            */
            PPVphAB: number;
            AphC: any;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: InverterPhases2;
        } | {
            /**
             * @type number, double
            */
            DCW: number;
            /**
             * @type number, double
            */
            DCV: number;
            /**
             * @type number, double
            */
            DCA: number;
            /**
             * @type number, double
            */
            WH: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VAr: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            PhVphC: number;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PPVphCA: number;
            /**
             * @type number, double
            */
            PPVphBC: number;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            AphC: number;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: InverterPhases3;
        });
    }[];
    /**
     * @type array
    */
    invertersData: {
        /**
         * @type object
        */
        status: {
            /**
             * @type number, double
            */
            Ris_SF: number;
            /**
             * @type number, double
            */
            Ris: number;
            /**
             * @type number
            */
            RtSt: RtSt;
            /**
             * @type number, double
            */
            Tms: number;
            /**
             * @type string
            */
            TmSrc: string;
            /**
             * @type number
            */
            StActCtl: StActCtl;
            /**
             * @type number
            */
            StSetLimMsk: StSetLimMsk;
            /**
             * @type number, double
            */
            WAval_SF: number;
            /**
             * @type number, double
            */
            WAval: number;
            /**
             * @type number, double
            */
            VArAval_SF: number;
            /**
             * @type number, double
            */
            VArAval: number;
            /**
             * @type number
            */
            ECPConn: EcpConn;
            /**
             * @type number
            */
            StorConn: StorConn;
            /**
             * @type number
            */
            PVConn: PvConn;
            /**
             * @type number, double
            */
            L: number;
            /**
             * @type number
            */
            ID: StatusId;
            /**
             * @type string
            */
            ActVArhQ4: string;
            /**
             * @type string
            */
            ActVArhQ3: string;
            /**
             * @type string
            */
            ActVArhQ2: string;
            /**
             * @type string
            */
            ActVArhQ1: string;
            /**
             * @type string
            */
            ActVAh: string;
            /**
             * @type string
            */
            ActWh: string;
        };
        /**
         * @type object
        */
        settings: SettingsModel;
        /**
         * @type object
        */
        nameplate: NameplateModel;
        /**
         * @type object
        */
        inverter: InverterModel;
    }[];
    /**
     * @type object
    */
    meterMetrics: {
        meter: ({
            PFphC: any;
            PFphB: any;
            /**
             * @type number, double
            */
            PFphA: number;
            /**
             * @type number, double
            */
            PF: number;
            VARphC: any;
            VARphB: any;
            /**
             * @type number, double
            */
            VARphA: number;
            /**
             * @type number, double
            */
            VAR: number;
            VAphC: any;
            VAphB: any;
            /**
             * @type number, double
            */
            VAphA: number;
            /**
             * @type number, double
            */
            VA: number;
            WphC: any;
            WphB: any;
            /**
             * @type number, double
            */
            WphA: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            Hz: number;
            PPVphCA: any;
            PPVphBC: any;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            PPV: number;
            PhVphC: any;
            PhVphB: any;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PhV: number;
            AphC: any;
            AphB: any;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: MeterPhases;
        } | {
            PFphC: any;
            /**
             * @type number, double
            */
            PFphB: number;
            /**
             * @type number, double
            */
            PFphA: number;
            /**
             * @type number, double
            */
            PF: number;
            VARphC: any;
            /**
             * @type number, double
            */
            VARphB: number;
            /**
             * @type number, double
            */
            VARphA: number;
            /**
             * @type number, double
            */
            VAR: number;
            VAphC: any;
            /**
             * @type number, double
            */
            VAphB: number;
            /**
             * @type number, double
            */
            VAphA: number;
            /**
             * @type number, double
            */
            VA: number;
            WphC: any;
            /**
             * @type number, double
            */
            WphB: number;
            /**
             * @type number, double
            */
            WphA: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            Hz: number;
            PPVphCA: any;
            PPVphBC: any;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            PPV: number;
            PhVphC: any;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PhV: number;
            AphC: any;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: MeterPhases2;
        } | {
            /**
             * @type number, double
            */
            PFphC: number;
            /**
             * @type number, double
            */
            PFphB: number;
            /**
             * @type number, double
            */
            PFphA: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VARphC: number;
            /**
             * @type number, double
            */
            VARphB: number;
            /**
             * @type number, double
            */
            VARphA: number;
            /**
             * @type number, double
            */
            VAR: number;
            /**
             * @type number, double
            */
            VAphC: number;
            /**
             * @type number, double
            */
            VAphB: number;
            /**
             * @type number, double
            */
            VAphA: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            WphC: number;
            /**
             * @type number, double
            */
            WphB: number;
            /**
             * @type number, double
            */
            WphA: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            PPVphCA: number;
            /**
             * @type number, double
            */
            PPVphBC: number;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            PPV: number;
            /**
             * @type number, double
            */
            PhVphC: number;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PhV: number;
            /**
             * @type number, double
            */
            AphC: number;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: MeterPhases3;
        });
    };
    /**
     * @type object
    */
    metersData: {
        /**
         * @type object
        */
        meter: MeterModel;
        /**
         * @type object
        */
        common: CommonModel;
    };
};
export const inverterPhases4 = {
    "singlePhase": "singlePhase"
} as const;
export type InverterPhases4 = (typeof inverterPhases4)[keyof typeof inverterPhases4];
export const inverterPhases5 = {
    "splitPhase": "splitPhase"
} as const;
export type InverterPhases5 = (typeof inverterPhases5)[keyof typeof inverterPhases5];
export const inverterPhases6 = {
    "threePhase": "threePhase"
} as const;
export type InverterPhases6 = (typeof inverterPhases6)[keyof typeof inverterPhases6];
export const statusId2 = {
    "122": 122
} as const;
export type StatusId2 = (typeof statusId2)[keyof typeof statusId2];
export const meterPhases4 = {
    "singlePhase": "singlePhase"
} as const;
export type MeterPhases4 = (typeof meterPhases4)[keyof typeof meterPhases4];
export const meterPhases5 = {
    "splitPhase": "splitPhase"
} as const;
export type MeterPhases5 = (typeof meterPhases5)[keyof typeof meterPhases5];
export const meterPhases6 = {
    "threePhase": "threePhase"
} as const;
export type MeterPhases6 = (typeof meterPhases6)[keyof typeof meterPhases6];
/**
 * @description Ok
*/
export type SunspecDataQueryResponse = {
    /**
     * @type array
    */
    inverterMetrics: {
        /**
         * @type object
        */
        status: {
            /**
             * @type number, double
            */
            WAval: number;
            /**
             * @type number, double
            */
            VArAval: number;
            /**
             * @type number
            */
            ECPConn: EcpConn;
            /**
             * @type number
            */
            StorConn: StorConn;
            /**
             * @type number
            */
            PVConn: PvConn;
            /**
             * @type string
            */
            ActVArhQ4: string;
            /**
             * @type string
            */
            ActVArhQ3: string;
            /**
             * @type string
            */
            ActVArhQ2: string;
            /**
             * @type string
            */
            ActVArhQ1: string;
            /**
             * @type string
            */
            ActVAh: string;
            /**
             * @type string
            */
            ActWh: string;
        };
        /**
         * @type object
        */
        settings: {
            /**
             * @type number, double
            */
            ECPNomHz: number;
            /**
             * @type number, double
            */
            MaxRmpRte: number;
            /**
             * @type number, double
            */
            PFMinQ4: number;
            /**
             * @type number, double
            */
            PFMinQ3: number;
            /**
             * @type number, double
            */
            PFMinQ2: number;
            /**
             * @type number, double
            */
            PFMinQ1: number;
            /**
             * @type number, double
            */
            WGra: number;
            /**
             * @type number, double
            */
            VArMaxQ4: number;
            /**
             * @type number, double
            */
            VArMaxQ3: number;
            /**
             * @type number, double
            */
            VArMaxQ2: number;
            /**
             * @type number, double
            */
            VArMaxQ1: number;
            /**
             * @type number, double
            */
            VAMax: number;
            /**
             * @type number, double
            */
            VMin: number;
            /**
             * @type number, double
            */
            VMax: number;
            /**
             * @type number, double
            */
            VRefOfs: number;
            /**
             * @type number, double
            */
            VRef: number;
            /**
             * @type number, double
            */
            WMax: number;
        };
        /**
         * @type object
        */
        nameplate: {
            /**
             * @type number, double
            */
            MaxDisChaRte: number;
            /**
             * @type number, double
            */
            MaxChaRte: number;
            /**
             * @type number, double
            */
            AhrRtg: number;
            /**
             * @type number, double
            */
            WHRtg: number;
            /**
             * @type number, double
            */
            PFRtgQ4: number;
            /**
             * @type number, double
            */
            PFRtgQ3: number;
            /**
             * @type number, double
            */
            PFRtgQ2: number;
            /**
             * @type number, double
            */
            PFRtgQ1: number;
            /**
             * @type number, double
            */
            ARtg: number;
            /**
             * @type number, double
            */
            VArRtgQ4: number;
            /**
             * @type number, double
            */
            VArRtgQ3: number;
            /**
             * @type number, double
            */
            VArRtgQ2: number;
            /**
             * @type number, double
            */
            VArRtgQ1: number;
            /**
             * @type number, double
            */
            VARtg: number;
            /**
             * @type number, double
            */
            WRtg: number;
            /**
             * @type number
            */
            DERTyp: DerTyp;
        };
        inverter: ({
            /**
             * @type number, double
            */
            DCW: number;
            /**
             * @type number, double
            */
            DCV: number;
            /**
             * @type number, double
            */
            DCA: number;
            /**
             * @type number, double
            */
            WH: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VAr: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            W: number;
            PhVphC: any;
            PhVphB: any;
            /**
             * @type number, double
            */
            PhVphA: number;
            PPVphCA: any;
            PPVphBC: any;
            /**
             * @type number, double
            */
            PPVphAB: number;
            AphC: any;
            AphB: any;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: InverterPhases4;
        } | {
            /**
             * @type number, double
            */
            DCW: number;
            /**
             * @type number, double
            */
            DCV: number;
            /**
             * @type number, double
            */
            DCA: number;
            /**
             * @type number, double
            */
            WH: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VAr: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            W: number;
            PhVphC: any;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            PPVphCA: any;
            /**
             * @type number, double
            */
            PPVphBC: number;
            /**
             * @type number, double
            */
            PPVphAB: number;
            AphC: any;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: InverterPhases5;
        } | {
            /**
             * @type number, double
            */
            DCW: number;
            /**
             * @type number, double
            */
            DCV: number;
            /**
             * @type number, double
            */
            DCA: number;
            /**
             * @type number, double
            */
            WH: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VAr: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            PhVphC: number;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PPVphCA: number;
            /**
             * @type number, double
            */
            PPVphBC: number;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            AphC: number;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: InverterPhases6;
        });
    }[];
    /**
     * @type array
    */
    invertersData: {
        /**
         * @type object
        */
        status: {
            /**
             * @type number, double
            */
            Ris_SF: number;
            /**
             * @type number, double
            */
            Ris: number;
            /**
             * @type number
            */
            RtSt: RtSt;
            /**
             * @type number, double
            */
            Tms: number;
            /**
             * @type string
            */
            TmSrc: string;
            /**
             * @type number
            */
            StActCtl: StActCtl;
            /**
             * @type number
            */
            StSetLimMsk: StSetLimMsk;
            /**
             * @type number, double
            */
            WAval_SF: number;
            /**
             * @type number, double
            */
            WAval: number;
            /**
             * @type number, double
            */
            VArAval_SF: number;
            /**
             * @type number, double
            */
            VArAval: number;
            /**
             * @type number
            */
            ECPConn: EcpConn;
            /**
             * @type number
            */
            StorConn: StorConn;
            /**
             * @type number
            */
            PVConn: PvConn;
            /**
             * @type number, double
            */
            L: number;
            /**
             * @type number
            */
            ID: StatusId2;
            /**
             * @type string
            */
            ActVArhQ4: string;
            /**
             * @type string
            */
            ActVArhQ3: string;
            /**
             * @type string
            */
            ActVArhQ2: string;
            /**
             * @type string
            */
            ActVArhQ1: string;
            /**
             * @type string
            */
            ActVAh: string;
            /**
             * @type string
            */
            ActWh: string;
        };
        /**
         * @type object
        */
        settings: SettingsModel;
        /**
         * @type object
        */
        nameplate: NameplateModel;
        /**
         * @type object
        */
        inverter: InverterModel;
    }[];
    /**
     * @type object
    */
    meterMetrics: {
        meter: ({
            PFphC: any;
            PFphB: any;
            /**
             * @type number, double
            */
            PFphA: number;
            /**
             * @type number, double
            */
            PF: number;
            VARphC: any;
            VARphB: any;
            /**
             * @type number, double
            */
            VARphA: number;
            /**
             * @type number, double
            */
            VAR: number;
            VAphC: any;
            VAphB: any;
            /**
             * @type number, double
            */
            VAphA: number;
            /**
             * @type number, double
            */
            VA: number;
            WphC: any;
            WphB: any;
            /**
             * @type number, double
            */
            WphA: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            Hz: number;
            PPVphCA: any;
            PPVphBC: any;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            PPV: number;
            PhVphC: any;
            PhVphB: any;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PhV: number;
            AphC: any;
            AphB: any;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: MeterPhases4;
        } | {
            PFphC: any;
            /**
             * @type number, double
            */
            PFphB: number;
            /**
             * @type number, double
            */
            PFphA: number;
            /**
             * @type number, double
            */
            PF: number;
            VARphC: any;
            /**
             * @type number, double
            */
            VARphB: number;
            /**
             * @type number, double
            */
            VARphA: number;
            /**
             * @type number, double
            */
            VAR: number;
            VAphC: any;
            /**
             * @type number, double
            */
            VAphB: number;
            /**
             * @type number, double
            */
            VAphA: number;
            /**
             * @type number, double
            */
            VA: number;
            WphC: any;
            /**
             * @type number, double
            */
            WphB: number;
            /**
             * @type number, double
            */
            WphA: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            Hz: number;
            PPVphCA: any;
            PPVphBC: any;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            PPV: number;
            PhVphC: any;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PhV: number;
            AphC: any;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: MeterPhases5;
        } | {
            /**
             * @type number, double
            */
            PFphC: number;
            /**
             * @type number, double
            */
            PFphB: number;
            /**
             * @type number, double
            */
            PFphA: number;
            /**
             * @type number, double
            */
            PF: number;
            /**
             * @type number, double
            */
            VARphC: number;
            /**
             * @type number, double
            */
            VARphB: number;
            /**
             * @type number, double
            */
            VARphA: number;
            /**
             * @type number, double
            */
            VAR: number;
            /**
             * @type number, double
            */
            VAphC: number;
            /**
             * @type number, double
            */
            VAphB: number;
            /**
             * @type number, double
            */
            VAphA: number;
            /**
             * @type number, double
            */
            VA: number;
            /**
             * @type number, double
            */
            WphC: number;
            /**
             * @type number, double
            */
            WphB: number;
            /**
             * @type number, double
            */
            WphA: number;
            /**
             * @type number, double
            */
            W: number;
            /**
             * @type number, double
            */
            Hz: number;
            /**
             * @type number, double
            */
            PPVphCA: number;
            /**
             * @type number, double
            */
            PPVphBC: number;
            /**
             * @type number, double
            */
            PPVphAB: number;
            /**
             * @type number, double
            */
            PPV: number;
            /**
             * @type number, double
            */
            PhVphC: number;
            /**
             * @type number, double
            */
            PhVphB: number;
            /**
             * @type number, double
            */
            PhVphA: number;
            /**
             * @type number, double
            */
            PhV: number;
            /**
             * @type number, double
            */
            AphC: number;
            /**
             * @type number, double
            */
            AphB: number;
            /**
             * @type number, double
            */
            AphA: number;
            /**
             * @type number, double
            */
            A: number;
            /**
             * @type string
            */
            phases: MeterPhases6;
        });
    };
    /**
     * @type object
    */
    metersData: {
        /**
         * @type object
        */
        meter: MeterModel;
        /**
         * @type object
        */
        common: CommonModel;
    };
};
export type SunspecDataQuery = {
    Response: SunspecDataQueryResponse;
};

 /**
 * @description Ok
*/
export type SiteRealPower200 = {
    /**
     * @type number, double
    */
    _value: number;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    type: string;
    /**
     * @type string
    */
    phase: string;
}[];
/**
 * @description Ok
*/
export type SiteRealPowerQueryResponse = {
    /**
     * @type number, double
    */
    _value: number;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    type: string;
    /**
     * @type string
    */
    phase: string;
}[];
export type SiteRealPowerQuery = {
    Response: SiteRealPowerQueryResponse;
};

 /**
 * @description Ok
*/
export type ExportLimit200 = {
    /**
     * @type string
    */
    control: string;
    /**
     * @type number, double
    */
    _value: number;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
/**
 * @description Ok
*/
export type ExportLimitQueryResponse = {
    /**
     * @type string
    */
    control: string;
    /**
     * @type number, double
    */
    _value: number;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
export type ExportLimitQuery = {
    Response: ExportLimitQueryResponse;
};

 /**
 * @description Ok
*/
export type GenerationLimit200 = {
    /**
     * @type string
    */
    control: string;
    /**
     * @type number, double
    */
    _value: number;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
/**
 * @description Ok
*/
export type GenerationLimitQueryResponse = {
    /**
     * @type string
    */
    control: string;
    /**
     * @type number, double
    */
    _value: number;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
export type GenerationLimitQuery = {
    Response: GenerationLimitQueryResponse;
};

 /**
 * @description Ok
*/
export type Connection200 = {
    /**
     * @type boolean
    */
    _value: boolean;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
/**
 * @description Ok
*/
export type ConnectionQueryResponse = {
    /**
     * @type boolean
    */
    _value: boolean;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
export type ConnectionQuery = {
    Response: ConnectionQueryResponse;
};

 /**
 * @description Ok
*/
export type Energize200 = {
    /**
     * @type boolean
    */
    _value: boolean;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
/**
 * @description Ok
*/
export type EnergizeQueryResponse = {
    /**
     * @type boolean
    */
    _value: boolean;
    /**
     * @type string
    */
    _time: string;
    /**
     * @type string
    */
    _measurement: string;
    /**
     * @type string
    */
    name: string;
}[];
export type EnergizeQuery = {
    Response: EnergizeQueryResponse;
};

 /**
 * @description Ok
*/
export type CsipAusStatus200 = CertificateIds;
/**
 * @description Ok
*/
export type CsipAusStatusQueryResponse = CertificateIds;
export type CsipAusStatusQuery = {
    Response: CsipAusStatusQueryResponse;
};

 /**
 * @description Ok
*/
export type ExportLimitSchedule200 = RandomizedControlSchedule[];
/**
 * @description Ok
*/
export type ExportLimitScheduleQueryResponse = RandomizedControlSchedule[];
export type ExportLimitScheduleQuery = {
    Response: ExportLimitScheduleQueryResponse;
};

 /**
 * @description Ok
*/
export type GenerationLimitSchedule200 = RandomizedControlSchedule[];
/**
 * @description Ok
*/
export type GenerationLimitScheduleQueryResponse = RandomizedControlSchedule[];
export type GenerationLimitScheduleQuery = {
    Response: GenerationLimitScheduleQueryResponse;
};

 /**
 * @description Ok
*/
export type ConnectionSchedule200 = RandomizedControlSchedule[];
/**
 * @description Ok
*/
export type ConnectionScheduleQueryResponse = RandomizedControlSchedule[];
export type ConnectionScheduleQuery = {
    Response: ConnectionScheduleQueryResponse;
};

 /**
 * @description Ok
*/
export type EnergizeSchedule200 = RandomizedControlSchedule[];
/**
 * @description Ok
*/
export type EnergizeScheduleQueryResponse = RandomizedControlSchedule[];
export type EnergizeScheduleQuery = {
    Response: EnergizeScheduleQueryResponse;
};

 /**
 * @description No content
*/
export type CoordinatorStart204 = any;
export type CoordinatorStartMutationResponse = any;
export type CoordinatorStartMutation = {
    Response: CoordinatorStartMutationResponse;
};

 /**
 * @description Ok
*/
export type CoordinatorStatus200 = CoordinatorResponse;
/**
 * @description Ok
*/
export type CoordinatorStatusQueryResponse = CoordinatorResponse;
export type CoordinatorStatusQuery = {
    Response: CoordinatorStatusQueryResponse;
};

 /**
 * @description No content
*/
export type CoordinatorStop204 = any;
export type CoordinatorStopMutationResponse = any;
export type CoordinatorStopMutation = {
    Response: CoordinatorStopMutationResponse;
};