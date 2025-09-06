import { describe, expect, it } from 'vitest';
import { inverterDataSchema } from './inverterData.js';
import { DERTyp } from '../connections/sunspec/models/nameplate.js';
import { OperationalModeStatusValue } from '../sep2/models/operationModeStatus.js';
import { ConnectStatusValue } from '../sep2/models/connectStatus.js';
import { ChaSt } from '../connections/sunspec/models/storage.js';

describe('inverterDataSchema', () => {
    describe('basic inverter data validation', () => {
        it('should validate complete inverter data with storage', () => {
            const data = {
                inverter: {
                    realPower: 5000,
                    reactivePower: 100,
                    voltagePhaseA: 240.5,
                    voltagePhaseB: 241.0,
                    voltagePhaseC: 239.8,
                    frequency: 50.1,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 10000,
                    maxVA: 10000,
                    maxVar: 5000,
                },
                settings: {
                    maxW: 10000,
                    maxVA: 10000,
                    maxVar: 5000,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus:
                        ConnectStatusValue.Connected |
                        ConnectStatusValue.Available |
                        ConnectStatusValue.Operating,
                },
                storage: {
                    capacity: 15000,
                    maxChargeRate: 5000,
                    maxDischargeRate: 4500,
                    stateOfCharge: 75,
                    chargeStatus: ChaSt.CHARGING,
                    storageMode: 2,
                    chargeRate: 30,
                    dischargeRate: 0,
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.storage?.capacity).toBe(15000);
                expect(result.data.storage?.stateOfCharge).toBe(75);
                expect(result.data.storage?.chargeStatus).toBe(ChaSt.CHARGING);
            }
        });

        it('should validate inverter data without storage', () => {
            const data = {
                inverter: {
                    realPower: 3000,
                    reactivePower: 50,
                    voltagePhaseA: 240.0,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50.0,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 2500,
                },
                settings: {
                    maxW: 5000,
                    maxVA: null,
                    maxVar: null,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus: ConnectStatusValue.Connected,
                },
                // No storage field
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.storage).toBeUndefined();
            }
        });
    });

    describe('storage field validation', () => {
        const baseData = {
            inverter: {
                realPower: 0,
                reactivePower: 0,
                voltagePhaseA: 240,
                voltagePhaseB: null,
                voltagePhaseC: null,
                frequency: 50,
            },
            nameplate: {
                type: DERTyp.PV,
                maxW: 5000,
                maxVA: 5000,
                maxVar: 2500,
            },
            settings: {
                maxW: 5000,
                maxVA: null,
                maxVar: null,
            },
            status: {
                operationalModeStatus:
                    OperationalModeStatusValue.OperationalMode,
                genConnectStatus: ConnectStatusValue.Connected,
            },
        };

        it('should validate storage with null values for nullable fields', () => {
            const data = {
                ...baseData,
                storage: {
                    capacity: 10000,
                    maxChargeRate: 3000,
                    maxDischargeRate: 2500,
                    stateOfCharge: null, // Nullable
                    chargeStatus: null, // Nullable
                    storageMode: 0,
                    chargeRate: null, // Nullable
                    dischargeRate: null, // Nullable
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.storage?.stateOfCharge).toBeNull();
                expect(result.data.storage?.chargeStatus).toBeNull();
                expect(result.data.storage?.chargeRate).toBeNull();
                expect(result.data.storage?.dischargeRate).toBeNull();
            }
        });

        it('should validate all charge status values', () => {
            const chargeStatuses = [
                ChaSt.OFF,
                ChaSt.EMPTY,
                ChaSt.DISCHARGING,
                ChaSt.CHARGING,
                ChaSt.FULL,
                ChaSt.HOLDING,
                ChaSt.TESTING,
            ];

            chargeStatuses.forEach((status) => {
                const data = {
                    ...baseData,
                    storage: {
                        capacity: 5000,
                        maxChargeRate: 2000,
                        maxDischargeRate: 1800,
                        stateOfCharge: 50,
                        chargeStatus: status,
                        storageMode: 1,
                        chargeRate: 0,
                        dischargeRate: 0,
                    },
                };

                const result = inverterDataSchema.safeParse(data);
                expect(result.success).toBe(true);

                if (result.success) {
                    expect(result.data.storage?.chargeStatus).toBe(status);
                }
            });
        });

        it('should validate different storage modes', () => {
            const storageModes = [0, 1, 2, 3, 4, 255];

            storageModes.forEach((mode) => {
                const data = {
                    ...baseData,
                    storage: {
                        capacity: 8000,
                        maxChargeRate: 3000,
                        maxDischargeRate: 2800,
                        stateOfCharge: 60,
                        chargeStatus: ChaSt.HOLDING,
                        storageMode: mode,
                        chargeRate: 20,
                        dischargeRate: 15,
                    },
                };

                const result = inverterDataSchema.safeParse(data);
                expect(result.success).toBe(true);

                if (result.success) {
                    expect(result.data.storage?.storageMode).toBe(mode);
                }
            });
        });

        it('should handle zero capacity and rates', () => {
            const data = {
                ...baseData,
                storage: {
                    capacity: 0, // Zero capacity
                    maxChargeRate: 0, // Zero charge rate
                    maxDischargeRate: 0, // Zero discharge rate
                    stateOfCharge: 0, // Empty battery
                    chargeStatus: ChaSt.EMPTY,
                    storageMode: 0,
                    chargeRate: 0,
                    dischargeRate: 0,
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.storage?.capacity).toBe(0);
                expect(result.data.storage?.stateOfCharge).toBe(0);
            }
        });

        it('should handle negative values for real and reactive power', () => {
            const data = {
                ...baseData,
                inverter: {
                    realPower: -2000, // Importing power
                    reactivePower: -100, // Negative reactive power
                    voltagePhaseA: 240,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50,
                },
                storage: {
                    capacity: 12000,
                    maxChargeRate: 4000,
                    maxDischargeRate: 3500,
                    stateOfCharge: 25,
                    chargeStatus: ChaSt.DISCHARGING,
                    storageMode: 1,
                    chargeRate: 0,
                    dischargeRate: 80, // High discharge rate
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(true);

            if (result.success) {
                expect(result.data.inverter.realPower).toBe(-2000);
                expect(result.data.storage?.dischargeRate).toBe(80);
            }
        });
    });

    describe('validation errors', () => {
        it('should reject invalid DER type', () => {
            const data = {
                inverter: {
                    realPower: 0,
                    reactivePower: 0,
                    voltagePhaseA: 240,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50,
                },
                nameplate: {
                    type: 999, // Invalid DER type
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 2500,
                },
                settings: {
                    maxW: 5000,
                    maxVA: null,
                    maxVar: null,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus: ConnectStatusValue.Connected,
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject invalid charge status', () => {
            const data = {
                inverter: {
                    realPower: 0,
                    reactivePower: 0,
                    voltagePhaseA: 240,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 2500,
                },
                settings: {
                    maxW: 5000,
                    maxVA: null,
                    maxVar: null,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus: ConnectStatusValue.Connected,
                },
                storage: {
                    capacity: 5000,
                    maxChargeRate: 2000,
                    maxDischargeRate: 1800,
                    stateOfCharge: 50,
                    chargeStatus: 999, // Invalid charge status
                    storageMode: 1,
                    chargeRate: 0,
                    dischargeRate: 0,
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should reject missing required storage fields', () => {
            const data = {
                inverter: {
                    realPower: 0,
                    reactivePower: 0,
                    voltagePhaseA: 240,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 5000,
                    maxVA: 5000,
                    maxVar: 2500,
                },
                settings: {
                    maxW: 5000,
                    maxVA: null,
                    maxVar: null,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus: ConnectStatusValue.Connected,
                },
                storage: {
                    capacity: 5000,
                    // Missing required fields: maxChargeRate, maxDischargeRate, storageMode
                    stateOfCharge: 50,
                    chargeStatus: ChaSt.CHARGING,
                    chargeRate: 30,
                    dischargeRate: 0,
                },
            };

            const result = inverterDataSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
