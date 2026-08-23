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
        "batteryPowerFlowControl": true,
    },
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": {
                "type": "tcp",
                "ip": "192.168.1.6",
                "port": 502,
            },
            "unitId": 1,
        },
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 80,
            "batterySocMinPercent": 20,
            "batterySocMaxPercent": 95,
            "batteryPriorityMode": "battery_first",
            // "batteryChargeMaxWatts": 5000, // (number) optional: if omitted, the inverter's hardware limit applies
            // "batteryDischargeMaxWatts": 5000, // (number) optional: if omitted, the inverter's hardware limit applies
            // "exportLimitWatts": 5000 // (number) optional: if omitted, all surplus is exported
        },
    },
}
```

### Configuration Parameters

#### Global Settings (`inverterControl`)

| Parameter                        | Type    | Default | Description                                                                                                |
| -------------------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `batteryControlEnabled`          | boolean | false   | Enable battery control system                                                                              |
| `batteryPowerFlowControl`        | boolean | false   | Use intelligent power flow control                                                                         |
| `batteryAcceptanceHeadroomWatts` | number  | 100     | Slack (watts) allowed above the battery's observed acceptance when export is restricted. See section below |

#### Per-Inverter Settings (`inverters[]`)

| Parameter               | Type    | Default | Description                              |
| ----------------------- | ------- | ------- | ---------------------------------------- |
| `batteryControlEnabled` | boolean | false   | Enable battery control for this inverter |

#### Setpoint Parameters (`setpoints.fixed` or MQTT)

| Parameter                     | Type    | Default   | Description                                                                                                                                                  |
| ----------------------------- | ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `batterySocTargetPercent`     | number  | -         | Target SoC for charging (0-100)                                                                                                                              |
| `batterySocMinPercent`        | number  | -         | Minimum SoC, no discharge below this level                                                                                                                   |
| `batterySocMaxPercent`        | number  | -         | Maximum SoC, no charge above this level                                                                                                                      |
| `batteryChargeMaxWatts`       | number  | unlimited | Maximum charging power (watts). If omitted, the inverter's hardware limit applies                                                                            |
| `batteryDischargeMaxWatts`    | number  | unlimited | Maximum discharging power (watts). If omitted, the inverter's hardware limit applies                                                                         |
| `batteryPriorityMode`         | string  | -         | `"battery_first"` or `"export_first"`                                                                                                                        |
| `batteryGridChargingEnabled`  | boolean | false     | Allow charging battery from grid when solar is insufficient                                                                                                  |
| `batteryGridChargingMaxWatts` | number  | -         | Maximum power drawn from grid for battery charging (watts)                                                                                                   |
| `batteryExportTargetWatts`    | number  | 0         | Site-level export target (watts). Battery discharges to fill the gap between PV surplus and this target. See [Battery Export Target](#battery-export-target) |

### Priority Modes

#### Battery First Mode (`battery_first`)

Power allocation priority: **Consumption → Battery → Export**

```
Available solar power = Solar generation - Site consumption

1. Charge battery (up to batteryChargeMaxWatts)
2. Export remaining power (up to exportLimitWatts)
```

**Use case**: Maximize battery charging, export surplus only

#### Export First Mode (`export_first`)

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

### Grid Charging

When `batteryGridChargingEnabled` is `true` and the battery is below its target SoC, the system charges the battery from the grid when solar power is insufficient:

```
Grid charging behavior:
1. Solar charges battery first (existing behavior applies when excess solar)
2. When solar is insufficient, grid tops up:
   gridChargePower = min(batteryGridChargingMaxWatts, batteryChargeMaxWatts, batteryNeedWatts, importHeadroom)
3. Battery discharge is suppressed while grid charging is enabled
```

Grid charging respects the site import limit (`opModImpLimW` / `importLimitWatts`): the charge power is capped so that total site import (house load + battery charging) does not exceed the import limit.

> [!IMPORTANT]
> When grid charging is active, the battery does **not** discharge to reduce imports. These are conflicting goals — one pulls power from the grid to charge, the other discharges to reduce grid pull. When the battery reaches its target SoC, it holds idle until the external controller disables grid charging.

Grid charging is designed to be controlled by external automation tools via MQTT or fixed setpoints. No built-in tariff or forecasting logic is included — integration with tools like [EMHASS](https://github.com/davidusb-geek/emhass), Home Assistant automations, or time-of-use tariff schedules is left to the external controller.

> [!TIP]
> When using MQTT to control grid charging, configure `stalenessTimeoutSeconds` on the MQTT setpoint as a dead-man's switch. If the external automation tool crashes or loses connectivity, the MQTT setpoints will be discarded after the timeout and the system falls back to fixed setpoints (which should have `batteryGridChargingEnabled` absent or `false`). See [MQTT Staleness Timeout](./setpoints.md#staleness-timeout) for configuration details.

**Example: MQTT-controlled grid charging for time-of-use tariffs**

```jsonc
// Off-peak: enable grid charging at 3kW, charge battery to 100%
{
    "batteryGridChargingEnabled": true,
    "batteryGridChargingMaxWatts": 3000,
    "batterySocTargetPercent": 100,
    "batteryPriorityMode": "battery_first"
}

// Peak: disable grid charging, discharge to reduce imports
{
    "batteryGridChargingEnabled": false,
    "batteryPriorityMode": "export_first"
}
```

### Battery Export Target

When `batteryExportTargetWatts` is set, the battery discharges to achieve a target level of grid export. This uses **gap-filling semantics**: PV surplus counts toward the target, and the battery only discharges the difference.

```
Battery discharge for export = max(0, batteryExportTargetWatts - PV surplus)
```

| Scenario            | PV surplus | Target | Battery discharge for export   |
| ------------------- | ---------- | ------ | ------------------------------ |
| PV exceeds target   | 5000W      | 3000W  | 0W (PV already covers it)      |
| PV partially covers | 1000W      | 3000W  | 2000W (battery fills the gap)  |
| No PV (night)       | 0W         | 3000W  | 3000W (full battery discharge) |

The battery export is also hard-capped at the DOE export limit headroom: if the export limit is 5000W and PV is already exporting 4000W, the battery can only add 1000W regardless of the export target.

In addition to export, the battery always covers self-consumption (reducing grid imports) when not grid-charging.

> [!IMPORTANT]
> `batteryExportTargetWatts` is a site-level target, not a battery-only target. PV generation counts toward it. If PV surplus alone exceeds the target, the battery will idle rather than discharge unnecessarily. This preserves battery capacity for when PV is insufficient.

**Example: MQTT-controlled battery export for time-of-use tariffs**

```jsonc
// Peak export period: discharge battery to export 3kW
{
    "batteryExportTargetWatts": 3000,
    "batteryPriorityMode": "export_first",
    "batterySocMinPercent": 20
}

// Off-peak: stop battery export, charge from grid
{
    "batteryExportTargetWatts": 0,
    "batteryGridChargingEnabled": true,
    "batteryGridChargingMaxWatts": 3000,
    "batterySocTargetPercent": 100
}
```

### Battery Acceptance Headroom

When export is restricted (for example, during an Amber `negativeFeedIn` window or a tight DER limit setting `opModExpLimW` near zero), the controller caps the PV target at the battery's recently-observed acceptance rate plus a small headroom. This prevents PV from over-producing relative to what the battery can actually absorb, which would otherwise spill the unaccepted surplus to the grid in violation of the export limit.

The headroom is the slack above observed acceptance and is controlled by `inverterControl.batteryAcceptanceHeadroomWatts` (default `100`).

#### Why headroom is needed

The commanded battery charge rate can exceed what the battery + inverter system will actually absorb, for several reasons:

- **Hardware ceilings** — most installations have a continuous-charge ceiling well below the inverter nameplate maximum (often dictated by the battery's continuous current rating or the inverter's DC port)
- **Absorption near full SoC** — at high SoC the BMS holds actual acceptance below the commanded rate while voltage is held constant and current naturally falls
- **BMS protection** — temperature, cell balance, or fault states can reduce acceptance transiently
- **Thermal derating** — high-temperature operation reduces sustained charge power

When export is allowed, this gap is harmless — surplus PV just exports at the prevailing wholesale price. When export is blocked or restricted, that same gap appears as unwanted grid export.

A small headroom above observed acceptance lets an idle or freshly-started battery ramp up — the controller produces a little more PV than the battery currently absorbs, the battery sees the surplus and accepts more, the smoothed observed value rises, and the cap rises with it.

#### Trade-off

| Headroom | Ramp from idle to 9 kW acceptance | Steady-state residual leak (when export blocked) |
| -------- | --------------------------------- | ------------------------------------------------ |
| 0 W      | does not ramp from idle           | 0 W                                              |
| 50 W     | ~7.5 minutes                      | up to 50 W                                       |
| 100 W    | ~3.75 minutes                     | up to 100 W                                      |
| 250 W    | ~1.5 minutes                      | up to 250 W                                      |
| 500 W    | ~45 seconds                       | up to 500 W                                      |

Smaller values are stricter about export compliance but ramp slower. Larger values ramp faster but allow more transient leakage during the ramp window and small steady-state leakage at the acceptance ceiling.

Setting `0` disables the headroom entirely — under strict zero export the battery cannot start charging from solar at all (an idle battery sees zero PV surplus and never gets the chance to begin accepting). Use only if your DER agreement absolutely cannot tolerate any transient overshoot.

> [!IMPORTANT]
> Users on dynamic export connections should not set this high, as the headroom may exceed connection-agreement limits during the ramp window. The default `100` is a conservative starting point matching the legacy `chargeBufferWatts` convention.

#### When the cap is active

The cap only applies when `opModExpLimW` is below approximately `500W` (the "export restricted" threshold). When export is freely allowed, no cap is applied and the controller behaves as before — any surplus PV beyond battery acceptance is allowed to export.

### MQTT Dynamic Control

Battery parameters can be changed dynamically via MQTT:

```jsonc
{
    "batterySocTargetPercent": 100,
    "batteryPriorityMode": "battery_first",
    "batteryGridChargingEnabled": true,
    "batteryGridChargingMaxWatts": 3000,
    "batteryExportTargetWatts": 0,
    "exportLimitWatts": 0,
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

| Message                                                                              | Level | Meaning                                                                            |
| ------------------------------------------------------------------------------------ | ----- | ---------------------------------------------------------------------------------- |
| `Inverter has battery storage capability`                                            | INFO  | SunSpec Model 124 detected on inverter                                             |
| `Inverter does not have battery storage capability`                                  | WARN  | Inverter lacks Model 124 — battery commands will be skipped                        |
| `Wrote battery controls`                                                             | INFO  | Battery charge/discharge command written successfully                              |
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

Goal: Charge battery to 80% SoC, export surplus

```jsonc
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true,
        "batteryPowerFlowControl": true,
    },
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.6", "port": 502 },
            "unitId": 1,
        },
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 80,
            "batteryPriorityMode": "battery_first",
        },
    },
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
            "batteryChargeMaxWatts": 3000, // optional: cap charge rate to protect battery
            "batteryDischargeMaxWatts": 3000, // optional: cap discharge rate
            "exportLimitWatts": 5000, // optional: cap export to 5kW
        },
    },
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
            "unitId": 1,
        },
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.11", "port": 502 },
            "unitId": 1,
        },
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 90,
            "batteryPriorityMode": "battery_first",
            "batteryChargeMaxWatts": 8000, // optional: combined limit for both inverters
            "exportLimitWatts": 0,
        },
    },
}
```

Runtime behavior:

- System detects Inverter 1 has battery, Inverter 2 does not
- Battery commands sent only to Inverter 1
- SoC and power limits from Inverter 1 used for calculations
- No errors or warnings for Inverter 2 lacking battery

#### Example 4: Grid Charging with External Automation

Goal: Charge battery from grid during off-peak hours, controlled by external automation via MQTT

```jsonc
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true,
        "batteryPowerFlowControl": true,
    },
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.6", "port": 502 },
            "unitId": 1,
        },
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 50,
            "batteryPriorityMode": "battery_first",
            "batteryChargeMaxWatts": 5000, // optional: cap charge rate
            "batteryDischargeMaxWatts": 5000, // optional: cap discharge rate
            "exportLimitWatts": 0,
        },
    },
}
```

External automation (e.g., Home Assistant, EMHASS) publishes MQTT messages to control grid charging:

- **Off-peak start**: `{"batteryGridChargingEnabled": true, "batteryGridChargingMaxWatts": 3000, "batterySocTargetPercent": 100}`
- **Peak start**: `{"batteryGridChargingEnabled": false, "batteryPriorityMode": "export_first"}`

While grid charging is enabled, the battery charges from solar + grid. Once it reaches the target SoC, it holds idle until the external tool disables grid charging, at which point normal discharge behavior resumes.

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
        "chargeBufferWatts": 100,
    },
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
        "chargeBufferWatts": 500,
    },
    "inverterControl": {
        "enabled": true,
    },
}
```

**After:**

```jsonc
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true,
        "batteryPowerFlowControl": true,
    },
    "inverters": [
        {
            "type": "sunspec",
            "batteryControlEnabled": true,
            "connection": { "type": "tcp", "ip": "192.168.1.6", "port": 502 },
            "unitId": 1,
        },
    ],
    "setpoints": {
        "fixed": {
            "batterySocTargetPercent": 80,
            "batteryPriorityMode": "battery_first",
            // "batteryChargeMaxWatts": 5000, // optional: if omitted, the inverter's hardware limit applies
            // "exportLimitWatts": 5000 // optional: if omitted, all surplus is exported
        },
    },
}
```

### Configuration Validation

The project will reject configurations that use both methods:

```jsonc
{
    "battery": {
        "chargeBufferWatts": 500, // Error: Cannot use with batteryPowerFlowControl
    },
    "inverterControl": {
        "batteryPowerFlowControl": true, // Error: Cannot use with chargeBufferWatts
    },
}
```

**Error message:**

```
Cannot use both legacy battery.chargeBufferWatts and new inverterControl.batteryPowerFlowControl.
Please use only the new batteryPowerFlowControl feature, which provides comprehensive battery
power flow control. If you need the legacy behavior, either remove battery.chargeBufferWatts
(legacy) or set inverterControl.batteryPowerFlowControl to false (use new battery control).
```
