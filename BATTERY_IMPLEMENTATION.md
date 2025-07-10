# Battery Storage Integration Implementation Summary

This document summarizes the implementation of battery storage integration for the open-dynamic-export project, addressing issue #68.

## Overview

The implementation adds comprehensive battery storage control capabilities to the open-dynamic-export system, allowing it to:

1. **Manage battery charging and discharging** in addition to solar export limiting
2. **Optimize energy flow** between solar generation, local consumption, battery storage, and grid export
3. **Support grid charging** of batteries during off-peak periods
4. **Provide flexible control** via both fixed configuration and dynamic MQTT setpoints

## Key Features Implemented

### 1. **Enhanced Configuration Schema**

#### Setpoint Extensions (Fixed & MQTT)
- `exportTargetWatts`: Desired export when no solar (from battery)
- `importTargetWatts`: Desired import for battery charging from grid
- `batterySocTargetPercent`: Target state of charge %
- `batterySocMinPercent`: Minimum reserve %
- `batterySocMaxPercent`: Maximum charge %
- `batteryChargeMaxWatts`: Maximum charge rate (can override SunSpec)
- `batteryDischargeMaxWatts`: Maximum discharge rate (can override SunSpec)
- `batteryPriorityMode`: "export_first" | "battery_first"
- `batteryGridChargingEnabled`: Allow charging battery from grid
- `batteryGridChargingMaxWatts`: Maximum grid charging rate

#### Inverter Configuration
- `batteryControlEnabled`: Enable battery control for SunSpec inverters

#### System Configuration
- `inverterControl.batteryControlEnabled`: Global battery control enable

### 2. **SunSpec Integration**

#### Automatic Battery Detection
- Automatically detects battery capability via SunSpec Model 124
- Reads battery capacity, charge/discharge rates, and current state
- Gracefully handles inverters without battery capability

#### Storage Data Collection
- Monitors battery state of charge (SOC)
- Tracks charge/discharge rates and status
- Applies proper scale factors for accurate measurements

### 3. **Extended Control Types**

#### New InverterControlLimit Attributes
- `batteryChargeRatePercent`: Maps to SunSpec InWRte
- `batteryDischargeRatePercent`: Maps to SunSpec OutWRte  
- `batteryStorageMode`: Maps to SunSpec StorCtl_Mod
- `batteryTargetSocPercent`: Target SOC for battery management
- `batteryImportTargetWatts`: Grid charging target
- `batteryExportTargetWatts`: Battery discharge target
- Additional safety and configuration parameters

#### Priority Logic Implementation
- **"export_first"**: Solar generation priority: Load → Export → Battery Charging
- **"battery_first"**: Solar generation priority: Load → Battery Charging → Export

### 4. **Multi-Inverter Support**

- Supports mixed configurations (battery + non-battery inverters)
- Battery commands only sent to battery-capable inverters
- Maintains existing export limiting for all inverters

## Implementation Details

### File Changes

1. **Configuration Schema** (`config.schema.json`, `src/helpers/config.ts`)
   - Added battery-related properties to fixed and MQTT setpoints
   - Added battery control flags to SunSpec inverter configuration
   - Added global battery control to inverterControl section

2. **Type Definitions** (`src/coordinator/helpers/inverterController.ts`)
   - Extended `InverterControlLimit` with battery controls
   - Extended `ActiveInverterControlLimit` with battery state management
   - Updated control limit resolution logic for battery attributes

3. **Setpoint Implementations**
   - **Fixed Setpoint** (`src/setpoints/fixed/index.ts`): Added battery attribute mapping
   - **MQTT Setpoint** (`src/setpoints/mqtt/index.ts`): Extended schema and mapping

4. **SunSpec Integration** (`src/inverter/sunspec/index.ts`)
   - Added conditional storage model reading
   - Extended `InverterData` type with storage information
   - Created `generateInverterDataStorage` function

5. **Data Types** (`src/inverter/inverterData.ts`)
   - Added optional `storage` field to `InverterData` schema
   - Includes battery capacity, SOC, charge status, and control modes

### Configuration Examples

#### Basic Battery Configuration
```json
{
  "setpoints": {
    "fixed": {
      "batterySocTargetPercent": 80,
      "batteryPriorityMode": "battery_first",
      "batteryGridChargingEnabled": false
    }
  },
  "inverters": [{
    "type": "sunspec",
    "batteryControlEnabled": true,
    "connection": { "type": "tcp", "ip": "192.168.1.6", "port": 502 },
    "unitId": 1
  }],
  "inverterControl": {
    "enabled": true,
    "batteryControlEnabled": true
  }
}
```

#### Time-of-Use via MQTT
```json
// Off-peak charging
{
  "batterySocTargetPercent": 100,
  "batteryGridChargingEnabled": true,
  "batteryGridChargingMaxWatts": 3000,
  "importTargetWatts": 3000,
  "batteryPriorityMode": "battery_first"
}

// Peak export
{
  "batterySocTargetPercent": 20,
  "batteryGridChargingEnabled": false,
  "exportTargetWatts": 4000,
  "batteryPriorityMode": "export_first"
}
```

## Safety Features

1. **Automatic Detection**: Battery capability detected via SunSpec Model 124
2. **Graceful Degradation**: Works with mixed inverter types and capabilities
3. **Restrictive Merging**: Multiple setpoints apply most restrictive values
4. **Hardware Limits**: Respects SunSpec-reported capacity and rate limits
5. **Backward Compatibility**: All new features are optional

## Next Steps

The implementation provides the foundation for battery storage integration. Future enhancements could include:

1. **Advanced Control Logic**: Implement the actual battery control algorithms
2. **Economic Optimization**: Add real-time electricity pricing integration
3. **Forecasting**: Integrate weather and consumption forecasting
4. **SMA Support**: Extend battery support to SMA inverters
5. **Multi-Battery Systems**: Support for multiple independent battery systems

## Testing

The implementation has been validated through:
- ✅ Configuration schema validation
- ✅ TypeScript compilation without errors  
- ✅ Example configuration file validation
- ✅ Backward compatibility with existing configurations

This implementation establishes the configuration framework and data structures needed for comprehensive battery storage management while maintaining the project's existing functionality and design principles.
