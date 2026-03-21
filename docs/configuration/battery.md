# Battery

An **optional** battery can be configured to adjust the controller behaviour. There are two approaches to battery control: the legacy charge buffer method and the new intelligent battery power flow control system.

[[toc]]

## Overview

The project provides two battery control mechanisms:

1. **Legacy Charge Buffer** (Simple): A basic override that ensures minimum charging headroom
2. **Battery Power Flow Control** (Recommended): Intelligent control with SoC awareness, priority modes, and multi-inverter support

> [!IMPORTANT]
> These two mechanisms are **mutually exclusive**. Configurations that attempt to use both simultaneously will be rejected.

## Battery Power Flow Control (Recommended)

### Overview

The battery power flow control system provides comprehensive, intelligent battery management with awareness of battery state of charge (SoC), configurable priority modes, and support for multiple inverters with batteries.

### Key Features

- **SoC-Aware Control**: Monitors battery state of charge and respects min/max SoC limits
- **Priority Modes**: Choose between battery-first or export-first power allocation
- **Multi-Inverter Support**: Aggregates SoC and power limits across multiple batteries
- **Automatic Capability Detection**: Detects which inverters have battery storage via SunSpec
- **Grid Import Reduction**: Automatically discharges battery when importing power
- **Configurable Power Limits**: Set maximum charge/discharge rates
- **MQTT Dynamic Control**: Change battery parameters in real-time

### Configuration

Enable battery power flow control in `config.json`:

```jsonc
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true,
        "batteryPowerFlowControl": true
    },
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": {
                "type": "tcp",
                "ip": "192.168.1.6",
                "port": 502
            },
            "unitId": 1
        }
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 80,
            "batterySocMinPercent": 20,
            "batterySocMaxPercent": 95,
            "batteryChargeMaxWatts": 5000,
            "batteryDischargeMaxWatts": 5000,
            "batteryPriorityMode": "battery_first",
            "exportLimitWatts": 0
        }
    }
}
```

### Configuration Parameters

#### Global Settings (`inverterControl`)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `batteryControlEnabled` | boolean | false | Enable battery control system |
| `batteryPowerFlowControl` | boolean | false | Use intelligent power flow control |

#### Per-Inverter Settings (`inverters[]`)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `batteryControlEnabled` | boolean | false | Enable battery control for this inverter |

#### Setpoint Parameters (`setpoints.fixed` or MQTT)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `batterySocTargetPercent` | number | - | Target SoC for charging (0-100) |
| `batterySocMinPercent` | number | - | Minimum SoC, no discharge below this level |
| `batterySocMaxPercent` | number | - | Maximum SoC, no charge above this level |
| `batteryChargeMaxWatts` | number | - | Maximum charging power (watts) |
| `batteryDischargeMaxWatts` | number | - | Maximum discharging power (watts) |
| `batteryPriorityMode` | string | - | `"battery_first"` or `"export_first"` |
| `batteryGridChargingEnabled` | boolean | false | Allow charging from grid (future use) |
| `batteryGridChargingMaxWatts` | number | - | Max grid charging power (future use) |

### Priority Modes

#### Battery First Mode

Power allocation priority: **Consumption → Battery → Export**

```
Available solar power = Solar generation - Site consumption

1. Charge battery (up to batteryChargeMaxWatts)
2. Export remaining power (up to exportLimitWatts)
```

**Use case**: Maximize battery charging, export surplus only

#### Export First Mode

Power allocation priority: **Consumption → Export → Battery**

```
Available solar power = Solar generation - Site consumption

1. Export power (up to exportLimitWatts)
2. Charge battery with remaining power (up to batteryChargeMaxWatts)
```

**Use case**: Maximize grid export (e.g., high feed-in tariff), charge battery with surplus

### Multi-Inverter Behavior

When multiple inverters have batteries:

- **SoC Aggregation**: Average SoC calculated across all batteries
- **Power Limits**: Total charge/discharge limits summed from all batteries
- **Capability Detection**: System automatically identifies which inverters have storage
- **Graceful Handling**: Battery commands only sent to capable inverters

**Example with 2 inverters:**
```
Inverter 1: 80% SoC, 10kWh capacity, 5kW max charge/discharge
Inverter 2: 60% SoC, 8kWh capacity, 3kW max charge/discharge

Aggregated values:
- Average SoC: 70%
- Total capacity: 18kWh
- Total max charge: 8kW
- Total max discharge: 8kW
```

#### Design Decisions

**Why average SoC?** When multiple batteries exist, the project calculates the average SoC rather than min/max because it encourages fair, balanced charging across all batteries and provides a single representative value for power flow calculations.

**Why send the same command to all inverters?** The same battery control configuration is sent to all inverters for simplicity and safety. Each inverter's capability detection independently determines whether to execute battery commands, so inverters without storage silently ignore them. This avoids complex per-inverter scheduling while remaining extensible for future per-inverter control if needed.

### Import Power Handling

When the site is importing power (consuming more than generating):

```
Battery discharges to reduce grid import:
dischargePower = min(importPower, batteryDischargeMaxWatts, availableBatteryPower)
```

The project automatically uses the battery to offset grid imports, reducing energy costs.

### MQTT Dynamic Control

Battery parameters can be changed dynamically via MQTT:

```jsonc
{
    "batterySocTargetPercent": 100,
    "batteryPriorityMode": "battery_first",
    "batteryGridChargingEnabled": true,
    "batteryGridChargingMaxWatts": 3000,
    "exportLimitWatts": 0
}
```

This allows integration with:
- Time-of-use tariffs
- Weather forecasts
- VPP programs
- Home automation systems

### SunSpec Integration

Battery control uses **SunSpec Model 124** (Battery Storage):

- Automatic storage capability detection on first poll
- Writes to `StorCtl_Mod` register (control mode bitfield)
- Sets charge/discharge power targets (`WChaGra`, `WDisChaGra`)
- Optional percentage rates (`InWRte`, `OutWRte`)
- 60-second safety timeout for all commands

**Supported Inverters:**
- SunSpec-compliant inverters with Model 124 support
- Tested with systems implementing storage control

### Known Limitations

- **`batteryGridChargingEnabled` not yet implemented**: The parameter is accepted in configuration but not yet used in the power flow logic. Battery cannot currently charge from the grid when solar is insufficient.
- **Simplified battery need calculation**: `calculateBatteryNeedWatts()` returns the full `maxChargePower` when SoC is below target, rather than calculating precise watt-hours needed from battery capacity. This means the system requests maximum charge rate until target SoC is reached.
- **No per-inverter battery scheduling**: All battery-capable inverters receive the same charge/discharge command. Per-inverter differentiation (e.g., based on individual SoC) is not yet supported.

### Troubleshooting

#### Battery Control Not Working

1. **Verify battery control is enabled:**
   ```jsonc
   "inverterControl": { "batteryControlEnabled": true, "batteryPowerFlowControl": true }
   ```

2. **Check inverter has battery capability:**
   - Look for log message: `Inverter has battery storage capability`
   - If you see: `Inverter does not have battery storage capability` - the inverter lacks SunSpec Model 124

3. **Verify per-inverter setting:**
   ```jsonc
   "inverters": [{ "batteryControlEnabled": true, ... }]
   ```

#### Log Messages

Key log messages for diagnosing battery issues:

| Message | Level | Meaning |
|---------|-------|---------|
| `Inverter has battery storage capability` | INFO | SunSpec Model 124 detected on inverter |
| `Inverter does not have battery storage capability` | INFO | Inverter lacks Model 124 — battery commands will be skipped |
| `Wrote battery controls` | INFO | Battery charge/discharge command written successfully |
| `Battery control requested but inverter does not have storage capability - skipping` | DEBUG | Expected when a non-battery inverter is in the config with `batteryControlEnabled` |

#### No SoC Data Available

- Check inverter supports SunSpec Model 124 (Battery Storage)
- Verify inverter connection is stable
- Look for warnings in logs about storage model read failures

#### Battery Not Charging Despite Excess Solar

- Check `batterySocMaxPercent` - battery may be at maximum SoC
- Verify `batteryChargeMaxWatts` is not too restrictive
- Check if export limit is consuming all available power (use `battery_first` mode)

#### Battery Not Discharging When Importing

- Check `batterySocMinPercent` - battery may be at minimum SoC
- Verify `batteryDischargeMaxWatts` is sufficient
- Check battery control is enabled and working

### Examples

#### Example 1: Simple Battery Charging

Goal: Charge battery to 80% SoC, export surplus only

```jsonc
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true,
        "batteryPowerFlowControl": true
    },
    "inverters": [{
        "type": "sunspec",
        "batteryControlEnabled": true,
        "connection": { "type": "tcp", "ip": "192.168.1.6", "port": 502 },
        "unitId": 1
    }],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 80,
            "batteryPriorityMode": "battery_first",
            "batteryChargeMaxWatts": 5000,
            "exportLimitWatts": 0
        }
    }
}
```

#### Example 2: Export Priority with Battery Backup

Goal: Maximize export, charge battery with surplus, discharge during imports

```jsonc
{
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 50,
            "batterySocMinPercent": 20,
            "batteryPriorityMode": "export_first",
            "batteryChargeMaxWatts": 3000,
            "batteryDischargeMaxWatts": 3000,
            "exportLimitWatts": 5000
        }
    }
}
```

#### Example 3: Multi-Inverter Setup

Goal: Two inverters, one with battery, intelligent aggregation

```jsonc
{
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.10", "port": 502 },
            "unitId": 1
        },
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.11", "port": 502 },
            "unitId": 1
        }
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 90,
            "batteryPriorityMode": "battery_first",
            "batteryChargeMaxWatts": 8000,
            "exportLimitWatts": 0
        }
    }
}
```

Runtime behavior:
- System detects Inverter 1 has battery, Inverter 2 does not
- Battery commands sent only to Inverter 1
- SoC and power limits from Inverter 1 used for calculations
- No errors or warnings for Inverter 2 lacking battery

## Legacy Charge Buffer

### Overview

The legacy charge buffer is a simple mechanism that ensures a minimum amount of power is available for battery charging, even when export limits would otherwise prevent it.

> [!NOTE]
> This is a **legacy feature**. New deployments should use **Battery Power Flow Control** instead if they are SunSpec compatible, which provides much more sophisticated control.

### How It Works

In export limited scenarios, a "solar soaking" battery may not be able to charge correctly if the export limit is very low or zero. The charge buffer overrides the export limit when it falls below the configured watts, allowing the battery to charge.

### Configuration

To configure a charge buffer, add the following property to `config.json`:

```jsonc
{
    "battery": {
        "chargeBufferWatts": 100
    }
}
```

> [!IMPORTANT]
> Users on dynamic export connections MUST NOT set a high charge buffer which may violate your connection agreement for dynamic export limits.

### Limitations

- **No SoC Awareness**: Cannot detect if battery is full or charging
- **No Priority Control**: Cannot prioritize battery vs export
- **No Discharge Control**: Cannot reduce grid imports
- **No Multi-Inverter Support**: Simple global override only
- **Static Configuration**: Cannot be changed dynamically

**Why doesn't the charge buffer know if the battery is charged?**

The controller does not have direct control of batteries (especially batteries without an API, e.g., Tesla Powerwall), so it cannot know if the battery is configured for charging. Even if the battery SoC were known, the battery may be configured with a lower SoC cap or VPP mode which overrides the charging behaviour.

## Migration Guide

### From Charge Buffer to Power Flow Control

If you're currently using `battery.chargeBufferWatts`, migrate to power flow control:

**Before:**
```jsonc
{
    "battery": {
        "chargeBufferWatts": 500
    },
    "inverterControl": {
        "enabled": true
    }
}
```

**After:**
```jsonc
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true,
        "batteryPowerFlowControl": true
    },
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.6", "port": 502 },
            "unitId": 1
        }
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 80,
            "batteryChargeMaxWatts": 5000,
            "batteryPriorityMode": "battery_first",
            "exportLimitWatts": 0
        }
    }
}
```

### Configuration Validation

The project will reject configurations that use both methods:

```jsonc
{
    "battery": {
        "chargeBufferWatts": 500  // Error: Cannot use with batteryPowerFlowControl
    },
    "inverterControl": {
        "batteryPowerFlowControl": true  // Error: Cannot use with chargeBufferWatts
    }
}
```

**Error message:**
```
Cannot use both legacy battery.chargeBufferWatts and new inverterControl.batteryPowerFlowControl.
Please use only the new batteryPowerFlowControl feature, which provides comprehensive battery
power flow control. If you need the legacy behavior, either remove battery.chargeBufferWatts
(legacy) or set inverterControl.batteryPowerFlowControl to false (use new battery control).
```
