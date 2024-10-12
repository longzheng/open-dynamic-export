import { zodBitwiseEnumSchema } from '../../helpers/zod.js';

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
// Note: charge and discharge limits apply to bi-directional resources (such as a battery, that can act as a
// load and generator). In the case of a pure load or generator (e.g. solar system, hot water system),
// support for this extension requires that the charge or discharge limit be interpreted in the same manner
// as opModMaxLimW. If both values are present, the most restrictive value is to be used. Where both site
// and resource limits are specified within a single DERControlBase and are in conflict with each other, the
// EndDevice may ignore the opModLoadLimW and opModGenLimW values in favour of opModExpLimW
// and opModImpLimW settings.
export enum DOEControlType {
    // This is the constraint on the exported active power at the connection point.
    opModExpLimW = 1 << 0,
    // This is the constraint on the imported active power at the connection point.
    opModImpLimW = 1 << 1,
    // This is a constraint on the maximum allowable discharge rate, in Watts, specifically for a single physical
    // device (or aggregation of devices, excluding uncontrolled devices) such as an EV charge station.
    opModGenLimW = 1 << 2,
    // This is a constraint on the maximum allowable charge rate, in Watts, specifically for a single physical
    // device (or aggregation of devices, excluding uncontrolled devices) such as an EV charge station.
    opModLoadLimW = 1 << 3,
}

export const doeControlTypeSchema = zodBitwiseEnumSchema(DOEControlType);
