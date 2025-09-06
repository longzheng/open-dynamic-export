import { describe, expect, it, vi } from 'vitest';
import { FixedSetpoint } from './setpoints/fixed/index.js';
import { getActiveInverterControlLimit } from './coordinator/helpers/inverterController.js';
import { generateInverterDataStorage } from './inverter/sunspec/index.js';
import { inverterDataSchema } from './inverter/inverterData.js';
import { ChaSt } from './connections/sunspec/models/storage.js';
import { DERTyp } from './connections/sunspec/models/nameplate.js';
import { OperationalModeStatusValue } from './sep2/models/operationModeStatus.js';
import { ConnectStatusValue } from './sep2/models/connectStatus.js';
import { type Config } from './helpers/config.js';
import { type StorageModel } from './connections/sunspec/models/storage.js';

// Mock influxdb helper to avoid environment dependencies
vi.mock('./helpers/influxdb.js', () => ({
    writeControlLimit: vi.fn(),
}));

describe('Battery Control Integration Tests', () => {
    describe('End-to-End Battery Control Flow', () => {
        it('should demonstrate complete battery control flow from config to data', () => {
            // 1. Test Fixed Setpoint Configuration
            const batteryConfig: NonNullable<Config['setpoints']['fixed']> = {
                connect: true,
                exportLimitWatts: 5000,
                batterySocTargetPercent: 80,
                importTargetWatts: 2000,
                exportTargetWatts: 3000,
                batteryChargeMaxWatts: 4000,
                batteryDischargeMaxWatts: 3500,
                batteryPriorityMode: 'battery_first',
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 2500,
            };

            const fixedSetpoint = new FixedSetpoint({ config: batteryConfig });
            const controlLimit = fixedSetpoint.getInverterControlLimit();

            // Verify Fixed Setpoint produces correct InverterControlLimit
            expect(controlLimit.source).toBe('fixed');
            expect(controlLimit.batteryTargetSocPercent).toBe(80);
            expect(controlLimit.batteryPriorityMode).toBe('battery_first');
            expect(controlLimit.batteryGridChargingEnabled).toBe(true);
            expect(controlLimit.batteryChargeMaxWatts).toBe(4000);

            // 2. Test Control Limit Merging (multiple setpoints)
            const mqttControlLimit = {
                source: 'mqtt' as const,
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: 70, // More restrictive
                batteryImportTargetWatts: 1500, // More restrictive
                batteryExportTargetWatts: 2500, // More restrictive
                batteryChargeMaxWatts: 3000, // More restrictive
                batteryDischargeMaxWatts: 3000, // More restrictive
                batteryPriorityMode: undefined,
                batteryGridChargingEnabled: false, // More restrictive
                batteryGridChargingMaxWatts: undefined,
            };

            const activeControlLimit = getActiveInverterControlLimit([
                controlLimit,
                mqttControlLimit,
            ]);

            // Verify most restrictive values are selected
            expect(activeControlLimit.batteryTargetSocPercent?.value).toBe(70);
            expect(activeControlLimit.batteryTargetSocPercent?.source).toBe(
                'mqtt',
            );
            expect(activeControlLimit.batteryImportTargetWatts?.value).toBe(
                1500,
            );
            expect(activeControlLimit.batteryChargeMaxWatts?.value).toBe(3000);
            expect(activeControlLimit.batteryGridChargingEnabled?.value).toBe(
                false,
            );
            expect(activeControlLimit.batteryPriorityMode?.value).toBe(
                'battery_first',
            );

            // 3. Test SunSpec Storage Data Parsing
            const storageModel: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 15000, // 15 kWh capacity
                WChaMax_SF: 0,
                WChaGra: 5000, // 5 kW max charge
                WDisChaGra: 4000, // 4 kW max discharge
                WChaDisChaGra_SF: 0,
                ChaState: 75, // 75% SOC
                ChaState_SF: 0,
                ChaSt: ChaSt.CHARGING,
                StorCtl_Mod: 2, // Storage control mode
                InWRte: 30, // 30% charge rate
                OutWRte: 0, // 0% discharge rate
                InOutWRte_SF: 0,
            };

            const storageData = generateInverterDataStorage({
                storage: storageModel,
            });

            // Verify storage data parsing
            expect(storageData.capacity).toBe(15000);
            expect(storageData.stateOfCharge).toBe(75);
            expect(storageData.chargeStatus).toBe(ChaSt.CHARGING);
            expect(storageData.chargeRate).toBe(30);
            expect(storageData.maxChargeRate).toBe(5000);

            // 4. Test Complete InverterData Schema Validation
            const completeInverterData = {
                inverter: {
                    realPower: 3500, // Currently producing 3.5kW
                    reactivePower: 200,
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
                storage: storageData,
            };

            const validationResult =
                inverterDataSchema.safeParse(completeInverterData);
            expect(validationResult.success).toBe(true);

            if (validationResult.success) {
                expect(validationResult.data.storage?.capacity).toBe(15000);
                expect(validationResult.data.storage?.stateOfCharge).toBe(75);
                expect(validationResult.data.storage?.chargeStatus).toBe(
                    ChaSt.CHARGING,
                );
            }
        });

        it('should handle battery control priority scenarios correctly', () => {
            // Test scenario: Multiple setpoints with different priority modes
            const exportFirstLimit = {
                source: 'fixed' as const,
                opModConnect: true,
                opModEnergize: true,
                opModExpLimW: 5000,
                opModGenLimW: 10000,
                opModImpLimW: 8000,
                opModLoadLimW: 6000,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: 90,
                batteryImportTargetWatts: 3000,
                batteryExportTargetWatts: 4000,
                batteryChargeMaxWatts: 5000,
                batteryDischargeMaxWatts: 4000,
                batteryPriorityMode: 'export_first' as const,
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 3000,
            };

            const batteryFirstLimit = {
                source: 'mqtt' as const,
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: 85,
                batteryImportTargetWatts: 2500,
                batteryExportTargetWatts: 3500,
                batteryChargeMaxWatts: 4500,
                batteryDischargeMaxWatts: 3500,
                batteryPriorityMode: 'battery_first' as const,
                batteryGridChargingEnabled: undefined,
                batteryGridChargingMaxWatts: undefined,
            };

            const activeControl = getActiveInverterControlLimit([
                exportFirstLimit,
                batteryFirstLimit,
            ]);

            // battery_first should take precedence over export_first
            expect(activeControl.batteryPriorityMode?.value).toBe(
                'battery_first',
            );
            expect(activeControl.batteryPriorityMode?.source).toBe('mqtt');

            // Most restrictive values should be selected
            expect(activeControl.batteryTargetSocPercent?.value).toBe(85); // Lower target
            expect(activeControl.batteryImportTargetWatts?.value).toBe(2500); // Lower import
            expect(activeControl.batteryExportTargetWatts?.value).toBe(3500); // Lower export
            expect(activeControl.batteryChargeMaxWatts?.value).toBe(4500); // Lower charge max
            expect(activeControl.batteryDischargeMaxWatts?.value).toBe(3500); // Lower discharge max
        });

        it('should handle grid charging restrictions correctly', () => {
            // Test scenario: One setpoint allows grid charging, another disables it
            const gridChargingEnabled = {
                source: 'fixed' as const,
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: undefined,
                batteryImportTargetWatts: undefined,
                batteryExportTargetWatts: undefined,
                batteryChargeMaxWatts: undefined,
                batteryDischargeMaxWatts: undefined,
                batteryPriorityMode: undefined,
                batteryGridChargingEnabled: true,
                batteryGridChargingMaxWatts: 5000,
            };

            const gridChargingDisabled = {
                source: 'csipAus' as const,
                opModConnect: undefined,
                opModEnergize: undefined,
                opModExpLimW: undefined,
                opModGenLimW: undefined,
                opModImpLimW: undefined,
                opModLoadLimW: undefined,
                batteryChargeRatePercent: undefined,
                batteryDischargeRatePercent: undefined,
                batteryStorageMode: undefined,
                batteryTargetSocPercent: undefined,
                batteryImportTargetWatts: undefined,
                batteryExportTargetWatts: undefined,
                batteryChargeMaxWatts: undefined,
                batteryDischargeMaxWatts: undefined,
                batteryPriorityMode: undefined,
                batteryGridChargingEnabled: false, // Most restrictive
                batteryGridChargingMaxWatts: undefined,
            };

            const activeControl = getActiveInverterControlLimit([
                gridChargingEnabled,
                gridChargingDisabled,
            ]);

            // Grid charging should be disabled (most restrictive)
            expect(activeControl.batteryGridChargingEnabled?.value).toBe(false);
            expect(activeControl.batteryGridChargingEnabled?.source).toBe(
                'csipAus',
            );
        });

        it('should validate edge cases in storage data', () => {
            // Test with minimal/edge case storage data
            const edgeCaseStorage: StorageModel = {
                ID: 124,
                L: 16,
                WChaMax: 0, // Zero capacity
                WChaMax_SF: 0,
                WChaGra: 0,
                WDisChaGra: 0,
                WChaDisChaGra_SF: 0,
                ChaState: null, // SOC unavailable
                ChaState_SF: 0,
                ChaSt: ChaSt.OFF,
                StorCtl_Mod: 0,
                InWRte: null, // Rates unavailable
                OutWRte: null,
                InOutWRte_SF: 0,
            };

            const storageData = generateInverterDataStorage({
                storage: edgeCaseStorage,
            });

            expect(storageData.capacity).toBe(0);
            expect(storageData.stateOfCharge).toBeNull();
            expect(storageData.chargeStatus).toBe(ChaSt.OFF);
            expect(storageData.chargeRate).toBeNull();
            expect(storageData.dischargeRate).toBeNull();

            // Should still validate as a complete inverter data object
            const inverterData = {
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
                    operationalModeStatus: OperationalModeStatusValue.Off,
                    genConnectStatus: ConnectStatusValue.Connected,
                },
                storage: storageData,
            };

            const result = inverterDataSchema.safeParse(inverterData);
            expect(result.success).toBe(true);
        });
    });
});
