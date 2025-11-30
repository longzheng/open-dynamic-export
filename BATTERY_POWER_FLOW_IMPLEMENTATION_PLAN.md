# Battery Power Flow Implementation Plan

## Objective

Implement explicit "consumption → battery → export" power flow control logic in the coordinator, independent of the `batteryChargeBuffer` hack. This will provide proper battery control using native battery-specific parameters.

## Current State

### What Exists:
1. **MQTT setpoint parameters** for battery control are defined and parsed:
   - `batteryChargeRatePercent`, `batteryDischargeRatePercent`
   - `batteryStorageMode`, `batteryTargetSocPercent`
   - `batteryImportTargetWatts`, `batteryExportTargetWatts`
   - `batterySocMinPercent`, `batterySocMaxPercent`
   - `batteryChargeMaxWatts`, `batteryDischargeMaxWatts`
   - `batteryPriorityMode`: `'export_first'` | `'battery_first'`
   - `batteryGridChargingEnabled`, `batteryGridChargingMaxWatts`

2. **InverterControlLimit type** includes all battery parameters (lines 45-67 in `inverterController.ts`)

3. **SunSpec Storage Model (124)** with writable fields:
   - `WChaMax`: Maximum charge watts
   - `WChaGra`: Maximum charging rate (default is MaxChaRte)
   - `WDisChaGra`: Maximum discharging rate
   - `StorCtl_Mod`: Storage control mode (bitfield)
   - `MinRsvPct`: Minimum reserve percentage
   - `InWRte`: Charge rate percent
   - `OutWRte`: Discharge rate percent
   - `ChaGriSet`: Grid charging permission

4. **Battery data reading** is implemented (`getStorageModel`, `generateInverterDataStorage`)

5. **Battery control infrastructure** exists but **battery writing is not implemented** in `onControl()`

### What's Missing:
1. ❌ **Power flow calculation logic** that determines battery charge/discharge based on available power
2. ❌ **Battery setpoint application** in `InverterController.onControl()`
3. ❌ **Storage model writing** in `SunSpecInverterDataPoller.onControl()`
4. ❌ **Battery state tracking** (SOC, current charge/discharge rates)
5. ❌ **Integration with export limit calculations**

## Implementation Architecture

### Phase 1: Power Flow Calculation Logic

**Location**: `src/coordinator/helpers/batteryPowerFlowCalculator.ts` (new file)

Create a new function that calculates battery target power based on:
- Current solar generation
- Current load (consumption)
- Current battery SOC
- Export limit
- Battery limits (max charge/discharge watts)
- Battery priority mode
- Battery target SOC

```typescript
export type BatteryPowerFlowCalculation = {
    targetBatteryPowerWatts: number; // positive = charge, negative = discharge
    targetExportWatts: number;
    targetSolarWatts: number;
    batteryMode: 'charge' | 'discharge' | 'idle';
};

export function calculateBatteryPowerFlow({
    solarWatts,
    siteWatts, // positive = import, negative = export
    batterySocPercent,
    batteryTargetSocPercent,
    batterySocMinPercent,
    batterySocMaxPercent,
    batteryChargeMaxWatts,
    batteryDischargeMaxWatts,
    exportLimitWatts,
    batteryPriorityMode,
    batteryGridChargingEnabled,
}: {
    solarWatts: number;
    siteWatts: number;
    batterySocPercent: number | null;
    batteryTargetSocPercent: number | undefined;
    batterySocMinPercent: number | undefined;
    batterySocMaxPercent: number | undefined;
    batteryChargeMaxWatts: number | undefined;
    batteryDischargeMaxWatts: number | undefined;
    exportLimitWatts: number;
    batteryPriorityMode: 'export_first' | 'battery_first' | undefined;
    batteryGridChargingEnabled: boolean | undefined;
}): BatteryPowerFlowCalculation;
```

**Power Flow Logic**:

1. **Calculate available power**: `availablePower = solarWatts + siteWatts`
   - If `siteWatts > 0` (importing), available = solar only
   - If `siteWatts < 0` (exporting), available = solar - load

2. **Check battery SOC constraints**:
   - If SOC >= `batterySocMaxPercent`, no charging
   - If SOC <= `batterySocMinPercent`, no discharging

3. **Determine battery target based on priority mode**:

   **If `battery_first` (default)**:
   ```
   Priority 1: Local consumption (automatic via grid meter)
   Priority 2: Battery charging (up to batteryChargeMaxWatts or until targetSoc)
   Priority 3: Export (up to exportLimitWatts)
   ```

   **If `export_first`**:
   ```
   Priority 1: Local consumption (automatic)
   Priority 2: Export (up to exportLimitWatts)  
   Priority 3: Battery charging (with remaining power)
   ```

4. **Calculate target battery power**:
   ```typescript
   if (batteryPriorityMode === 'battery_first') {
       // Charge battery first
       const batteryNeed = calculateBatteryNeed(batterySocPercent, batteryTargetSocPercent);
       const batteryChargePower = Math.min(
           availablePower,
           batteryChargeMaxWatts ?? Number.MAX_SAFE_INTEGER,
           batteryNeed
       );
       
       const remainingPower = availablePower - batteryChargePower;
       const exportPower = Math.min(remainingPower, exportLimitWatts);
       
   } else { // export_first
       // Export first
       const exportPower = Math.min(availablePower, exportLimitWatts);
       const remainingPower = availablePower - exportPower;
       const batteryChargePower = Math.min(
           remainingPower,
           batteryChargeMaxWatts ?? Number.MAX_SAFE_INTEGER
       );
   }
   ```

### Phase 2: Integrate Battery Calculation into InverterController

**Location**: `src/coordinator/helpers/inverterController.ts`

Modify `calculateInverterConfiguration()` to:

1. **Accept battery state** from DER samples:
   ```typescript
   batterySocPercent: number | null;
   batteryChargeMaxWatts: number | undefined;
   batteryDischargeMaxWatts: number | undefined;
   ```

2. **Call battery power flow calculator** if battery control is enabled:
   ```typescript
   const batteryCalculation = batteryControlLimit ? 
       calculateBatteryPowerFlow({
           solarWatts,
           siteWatts,
           batterySocPercent,
           ...batteryControlLimit
       }) : null;
   ```

3. **Use battery calculation** to determine final target solar watts:
   ```typescript
   const targetSolarWatts = batteryCalculation ?
       batteryCalculation.targetSolarWatts :
       calculateTargetSolarWatts({ ... });
   ```

4. **Return battery configuration** alongside inverter configuration:
   ```typescript
   export type InverterConfiguration =
       | { type: 'disconnect' }
       | { type: 'deenergize' }
       | {
           type: 'limit';
           invertersCount: number;
           targetSolarWatts: number;
           targetSolarPowerRatio: number;
           batteryControl?: BatteryControlConfiguration;
       };

   export type BatteryControlConfiguration = {
       targetPowerWatts: number; // positive = charge, negative = discharge
       mode: 'charge' | 'discharge' | 'idle';
       chargeRatePercent?: number;
       dischargeRatePercent?: number;
       storageMode: number; // StorCtl_Mod value
   };
   ```

### Phase 3: Write Battery Controls to Inverter

**Location**: `src/inverter/sunspec/index.ts`

Modify `generateControlsModelWriteFromInverterConfiguration()` and create companion function for storage:

```typescript
export function generateStorageModelWriteFromBatteryControl({
    batteryControl,
    storageModel,
}: {
    batteryControl: BatteryControlConfiguration;
    storageModel: StorageModel;
}): StorageModelWrite {
    return {
        ...storageModel,
        StorCtl_Mod: batteryControl.storageMode,
        WChaGra: batteryControl.mode === 'charge' ? 
            Math.abs(batteryControl.targetPowerWatts) : 0,
        WDisChaGra: batteryControl.mode === 'discharge' ?
            Math.abs(batteryControl.targetPowerWatts) : 0,
        InWRte: batteryControl.chargeRatePercent ?? null,
        OutWRte: batteryControl.dischargeRatePercent ?? null,
        // Revert timeouts for safety
        InOutWRte_RvrtTms: 60,
    };
}
```

Update `SunSpecInverterDataPoller.onControl()`:

```typescript
override async onControl(
    inverterConfiguration: InverterConfiguration,
): Promise<void> {
    const controlsModel = await this.inverterConnection.getControlsModel();

    const writeControlsModel =
        generateControlsModelWriteFromInverterConfiguration({
            inverterConfiguration,
            controlsModel,
        });

    if (this.applyControl) {
        try {
            await this.inverterConnection.writeControlsModel(
                writeControlsModel,
            );

            // NEW: Write battery controls if present
            if (
                this.batteryControlEnabled &&
                inverterConfiguration.type === 'limit' &&
                inverterConfiguration.batteryControl
            ) {
                const storageModel = await this.inverterConnection.getStorageModel();
                if (storageModel) {
                    const writeStorageModel = generateStorageModelWriteFromBatteryControl({
                        batteryControl: inverterConfiguration.batteryControl,
                        storageModel,
                    });
                    await this.inverterConnection.writeStorageModel(writeStorageModel);
                }
            }
        } catch (error) {
            this.logger.error(error, 'Error writing inverter controls value');
        }
    }
}
```

### Phase 4: SunSpec StorCtl_Mod Mapping

**Location**: `src/connections/sunspec/models/storage.ts`

The `StorCtl_Mod` is a bitfield. Common values:
- `0` = No control / Normal operation
- `1` = Charge
- `2` = Discharge  
- `3` = Charge + Discharge (both enabled)

Add enum:
```typescript
export enum StorCtl_Mod {
    NORMAL = 0,
    CHARGE = 1,
    DISCHARGE = 2,
    CHARGE_DISCHARGE = 3,
}
```

## Testing Strategy

1. **Unit tests** for `calculateBatteryPowerFlow()`:
   - Test battery_first mode
   - Test export_first mode
   - Test SOC constraints
   - Test power limits

2. **Integration tests** in `inverterController.test.ts`:
   - Test battery control integration
   - Test fallback when battery unavailable
   - Test interaction with export limits

3. **Manual testing** with `set_mqtt.sh`:
   - Send various battery control parameters
   - Observe inverter behavior
   - Verify storage model writes

## Migration Path

1. **Keep `batteryChargeBuffer` working** for backward compatibility
2. **Make battery power flow opt-in** via config flag:
   ```json
   {
       "inverterControl": {
           "batteryPowerFlowControl": true
       }
   }
   ```
3. **When battery power flow is enabled**, ignore `batteryChargeBuffer`
4. **Document migration** in BATTERY_IMPLEMENTATION.md

## Files to Create/Modify

### New Files:
- `src/coordinator/helpers/batteryPowerFlowCalculator.ts`
- `src/coordinator/helpers/batteryPowerFlowCalculator.test.ts`

### Modified Files:
- `src/coordinator/helpers/inverterController.ts`
- `src/coordinator/helpers/inverterController.test.ts`
- `src/inverter/sunspec/index.ts`
- `src/inverter/sunspec/index.test.ts`
- `src/connections/sunspec/models/storage.ts`
- `src/helpers/config.ts` (add config flag)

## Next Steps

Would you like me to:
1. Start implementing Phase 1 (Power Flow Calculator)?
2. Create the test specifications first?
3. Update the config schema to add the feature flag?
4. All of the above?
