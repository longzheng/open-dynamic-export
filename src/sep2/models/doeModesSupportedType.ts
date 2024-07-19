// DER Management Envelope Extensions
// Support for Dynamic Operating Envelopes communicated through the protocol is enabled by the
// Australian Smart Inverter Profile extensions. This set of extensions shall be supported by conforming
// equipment to manage site- and device-level operating envelopes.
// Using these extensions, a device shall report its capabilities according to
// DERCapability::doeModesSupported according to the following bit positions:
// 0 opModExpLimW
// 1 opModImpLimW
// 2 opModGenLimW
// 3 opModLoadLimW
export enum DOEModesSupportedType {
    opModExpLimW = 1 << 0,
    opModImpLimW = 1 << 1,
    opModGenLimW = 1 << 2,
    opModLoadLimW = 1 << 3,
}
