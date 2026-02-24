import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as v from 'valibot';
import type { InverterData } from '../../inverter/inverterData.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import { DERTyp } from '../../connections/sunspec/models/nameplate.js';
import { derSampleDataSchema, generateDerSample } from './derSample.js';

describe('generateDerSample', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return a DerSample for a single inverter', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);

        const invertersData: InverterData[] = [
            {
                date: now,
                inverter: {
                    realPower: 6990,
                    reactivePower: -25,
                    voltagePhaseA: 230.1,
                    voltagePhaseB: 227.7,
                    voltagePhaseC: 229,
                    frequency: 49.99,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 7000,
                    maxVA: 7000,
                    maxVar: 7000,
                },
                settings: {
                    maxW: 7000,
                    maxVA: 7000,
                    maxVar: 7000,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus:
                        ConnectStatusValue.Available |
                        ConnectStatusValue.Connected |
                        ConnectStatusValue.Operating,
                },
            },
        ];

        const result = generateDerSample({ invertersData });

        expect(result).toStrictEqual({
            date: now,
            realPower: {
                type: 'noPhase',
                net: 6990,
            },
            reactivePower: {
                type: 'noPhase',
                net: -25,
            },
            voltage: {
                type: 'perPhase',
                phaseA: 230.1,
                phaseB: 227.7,
                phaseC: 229.0,
            },
            frequency: 49.99,
            nameplate: {
                maxVA: 7000,
                maxVar: 7000,
                maxW: 7000,
                type: 4,
            },
            settings: {
                setMaxVA: 7000,
                setMaxVar: 7000,
                setMaxW: 7000,
            },
            status: {
                operationalModeStatus:
                    OperationalModeStatusValue.OperationalMode,
                genConnectStatus:
                    ConnectStatusValue.Available |
                    ConnectStatusValue.Connected |
                    ConnectStatusValue.Operating,
            },
            invertersCount: 1,
        } satisfies typeof result);
    });

    it('should return a DerSample for a multiple inverters', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);

        const invertersData: InverterData[] = [
            {
                date: now,
                inverter: {
                    realPower: 6990,
                    reactivePower: -25,
                    voltagePhaseA: 230.1,
                    voltagePhaseB: 227.7,
                    voltagePhaseC: 229,
                    frequency: 49.99,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 7000,
                    maxVA: 7000,
                    maxVar: 7000,
                },
                settings: {
                    maxW: 7000,
                    maxVA: 7000,
                    maxVar: 7000,
                },
                status: {
                    operationalModeStatus:
                        OperationalModeStatusValue.OperationalMode,
                    genConnectStatus:
                        ConnectStatusValue.Available |
                        ConnectStatusValue.Connected |
                        ConnectStatusValue.Operating,
                },
            },
            {
                date: now,
                inverter: {
                    realPower: 6990,
                    reactivePower: -25,
                    voltagePhaseA: 230.1,
                    voltagePhaseB: null,
                    voltagePhaseC: null,
                    frequency: 50,
                },
                nameplate: {
                    type: DERTyp.PV,
                    maxW: 7000,
                    maxVA: 7000,
                    maxVar: 7000,
                },
                settings: {
                    maxW: 7000,
                    maxVA: 7000,
                    maxVar: 7000,
                },
                status: {
                    operationalModeStatus: OperationalModeStatusValue.Off,
                    genConnectStatus: ConnectStatusValue.Connected,
                },
            },
        ];

        const result = generateDerSample({ invertersData });

        expect(result).toStrictEqual({
            date: now,
            realPower: {
                type: 'noPhase',
                net: 13980,
            },
            reactivePower: {
                type: 'noPhase',
                net: -50,
            },
            voltage: {
                type: 'perPhase',
                phaseA: 230.1,
                phaseB: 227.7,
                phaseC: 229,
            },
            frequency: 49.995,
            nameplate: {
                maxVA: 14000,
                maxVar: 14000,
                maxW: 14000,
                type: 4,
            },
            settings: {
                setMaxVA: 14000,
                setMaxVar: 14000,
                setMaxW: 14000,
            },
            status: {
                operationalModeStatus:
                    OperationalModeStatusValue.OperationalMode,
                genConnectStatus:
                    ConnectStatusValue.Available |
                    ConnectStatusValue.Connected |
                    ConnectStatusValue.Operating,
            },
            invertersCount: 2,
        } satisfies typeof result);
    });
});

describe('derSampleDataSchema', () => {
    const validDerSampleData = {
        realPower: {
            type: 'noPhase',
            net: 1000,
        },
        reactivePower: {
            type: 'noPhase',
            net: 100,
        },
        voltage: {
            type: 'perPhase',
            phaseA: 230,
            phaseB: 231,
            phaseC: 229,
        },
        frequency: 50,
        nameplate: {
            type: DERTyp.PV,
            maxW: 7000,
            maxVA: 7000,
            maxVar: 7000,
        },
        settings: {
            setMaxW: 7000,
            setMaxVA: 7000,
            setMaxVar: 7000,
        },
        status: {
            operationalModeStatus: OperationalModeStatusValue.OperationalMode,
            genConnectStatus: ConnectStatusValue.Connected,
        },
        invertersCount: 1,
    };

    it('should accept operationalModeStatus enum number values', () => {
        expect(
            v.safeParse(derSampleDataSchema, validDerSampleData).success,
        ).toBe(true);
    });

    it('should reject operationalModeStatus values outside the enum', () => {
        expect(
            v.safeParse(derSampleDataSchema, {
                ...validDerSampleData,
                status: {
                    ...validDerSampleData.status,
                    operationalModeStatus: 99,
                },
            }).success,
        ).toBe(false);
    });

    it('should reject non-number operationalModeStatus enum keys', () => {
        expect(
            v.safeParse(derSampleDataSchema, {
                ...validDerSampleData,
                status: {
                    ...validDerSampleData.status,
                    operationalModeStatus: 'OperationalMode',
                },
            }).success,
        ).toBe(false);
    });
});
