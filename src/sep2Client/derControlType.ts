// Control modes supported by the DER. Bit positions SHALL be defined as follows:
// 0 - Charge mode
// 1 - Discharge mode
// 2 - opModConnect (Connect / Disconnect - implies galvanic isolation)
// 3 - opModEnergize (Energize / De-Energize)
// 4 - opModFixedPFAbsorbW (Fixed Power Factor Setpoint when absorbing active power)
// 5 - opModFixedPFInjectW (Fixed Power Factor Setpoint when injecting active power)
// 6 - opModFixedVar (Reactive Power Setpoint)
// 7 - opModFixedW (Charge / Discharge Setpoint)
// 8 - opModFreqDroop (Frequency-Watt Parameterized Mode)
// 9 - opModFreqWatt (Frequency-Watt Curve Mode)
// 10 - opModHFRTMayTrip (High Frequency Ride Through, May Trip Mode)
// 11 - opModHFRTMustTrip (High Frequency Ride Through, Must Trip Mode)
// 12 - opModHVRTMayTrip (High Voltage Ride Through, May Trip Mode)
// 13 - opModHVRTMomentaryCessation (High Voltage Ride Through, Momentary Cessation Mode)
// 14 - opModHVRTMustTrip (High Voltage Ride Through, Must Trip Mode)
// 15 - opModLFRTMayTrip (Low Frequency Ride Through, May Trip Mode)
// 16 - opModLFRTMustTrip (Low Frequency Ride Through, Must Trip Mode)
// 17 - opModLVRTMayTrip (Low Voltage Ride Through, May Trip Mode)
// 18 - opModLVRTMomentaryCessation (Low Voltage Ride Through, Momentary Cessation Mode)
// 19 - opModLVRTMustTrip (Low Voltage Ride Through, Must Trip Mode)
// 20 - opModMaxLimW (Maximum Active Power)
// 21 - opModTargetVar (Target Reactive Power)
// 22 - opModTargetW (Target Active Power)
// 23 - opModVoltVar (Volt-Var Mode)
// 24 - opModVoltWatt (Volt-Watt Mode)
// 25 - opModWattPF (Watt-PowerFactor Mode)
// 26 - opModWattVar (Watt-Var Mode)
// All other values reserved.
export enum DERControlType {
    chargeMode = 1 << 0,
    dischargeMode = 1 << 1,
    opModConnect = 1 << 2,
    opModEnergize = 1 << 3,
    opModFixedPFAbsorbW = 1 << 4,
    opModFixedPFInjectW = 1 << 5,
    opModFixedVar = 1 << 6,
    opModFixedW = 1 << 7,
    opModFreqDroop = 1 << 8,
    opModFreqWatt = 1 << 9,
    opModHFRTMayTrip = 1 << 10,
    opModHFRTMustTrip = 1 << 11,
    opModHVRTMayTrip = 1 << 12,
    opModHVRTMomentaryCessation = 1 << 13,
    opModHVRTMustTrip = 1 << 14,
    opModLFRTMayTrip = 1 << 15,
    opModLFRTMustTrip = 1 << 16,
    opModLVRTMayTrip = 1 << 17,
    opModLVRTMomentaryCessation = 1 << 18,
    opModLVRTMustTrip = 1 << 19,
    opModMaxLimW = 1 << 20,
    opModTargetVar = 1 << 21,
    opModTargetW = 1 << 22,
    opModVoltVar = 1 << 23,
    opModVoltWatt = 1 << 24,
    opModWattPF = 1 << 25,
    opModWattVar = 1 << 26,
}
