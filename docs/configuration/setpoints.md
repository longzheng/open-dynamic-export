# Setpoints

One or more setpoints can be configured to set the operating envelope of the site.

All setpoints are restrictive, that is a combination of multiple setpoints will evaluate all setpoints and enforce the most prohibitive value of each control type at any one time.

[[toc]]

## Control modes

The software supports 6 control modes mapped to the CSIP-AUS Dynamic Operating Envelope (DOE) modes.

| Mode            | Description                                                                                    | Overlap resolution     | Default value |
| --------------- | ---------------------------------------------------------------------------------------------- | ---------------------- | ------------- |
| opModConnect    | Connection to the grid                                                                         | Prioritize disconnect  | Connect       |
| opModEnergize   | Generate or consume energy (in practice for most inverters this is the same as `opModConnect`) | Prioritize de-energize | Energized     |
| opModExportLimW | Maximum site export limit (in watts)                                                           | Lower limit            | Unlimited     |
| opModGenLimW    | Maximum inverter generation limit (in watts)                                                   | Lower limit            | Unlimited     |
| opModImpLimW    | Maximum site import limit (in watts)                                                           | Lower limit            | Unlimited     |
| opModLoadLimW   | Maximum controllable load limit (in watts)                                                     | Lower limit            | Unlimited     |

## CSIP-AUS dynamic connection

Apply dynamic limits from an Australian energy utility CSIP-AUS server using a setpoint.

> [!IMPORTANT]
> This CSIP-AUS client cannot run without device certificates (and manufacturer certificates). See the [CSIP-AUS section](/csip-aus) for more information.

To use the CSIP-AUS provided limits as a setpoint, add following property to `config.json`

```jsonc
{
    "setpoints": {
        "csipAus": {
            "host": "https://sep2-test.energyq.com.au", // (string) required: the CSIP-AUS server host
            "dcapUri": "/api/v2/dcap", // (string) required: the device capability discovery URI
            "nmi": "1234567890", // (string) optional: for utilities that require in-band registration, the NMI of the site
            "fixedDefault": // (object) optional: the default limits in case CSIP-AUS server is unreachable and there is no default control which may be defined in the connection agreement
            {
                "exportLimitWatts": 1500, // (number) the default export limit in watts
                "importLimitWatts": 1500, // (number) the default import limit in watts
            }
        }
    }
    ...
}
```

The `nmi` is not required for Energex/Ergon Energy/Energy Queensland.

## Fixed limit

To use a setpoint to specify fixed limits (such as for fixed export limits), add the following property to `config.json`

```jsonc
{
    "setpoints": {
        "fixed": {
            "connect": true, // (true/false) optional: whether the inverters should be connected to the grid
            "exportLimitWatts": 5000, // (number) optional: the maximum export limit in watts
            "generationLimitWatts": 10000, // (number) optional: the maximum generation limit in watts
            "importLimitWatts": 5000, // (number) optional: the maximum import limit in watts (constrains battery grid charging)
            "loadLimitWatts": 10000, // (number) optional: the maximum load limit in watts (not currently used)

            // Battery control parameters (requires inverterControl.batteryPowerFlowControl: true)
            "batterySocTargetPercent": 80, // (number) optional: target state of charge (0-100)
            "batterySocMinPercent": 20, // (number) optional: minimum SoC, no discharge below this
            "batterySocMaxPercent": 95, // (number) optional: maximum SoC, no charge above this
            "batteryChargeMaxWatts": 5000, // (number) optional: maximum charging power. If omitted, the inverter's hardware limit applies
            "batteryDischargeMaxWatts": 5000, // (number) optional: maximum discharging power. If omitted, the inverter's hardware limit applies
            "batteryPriorityMode": "battery_first" // (string) optional: "battery_first" or "export_first"
        }
    }
    ...
}
```

> [!NOTE]
> Battery control parameters require `inverterControl.batteryPowerFlowControl` to be enabled. See [Battery Configuration](./battery.md) for detailed information.

````

## MQTT

To specify setpoint limits based on a MQTT topic, add the following property to `config.json`

```jsonc
{
    "setpoints": {
        "mqtt": {
            "host": "mqtt://192.168.1.123",
            "topic": "setpoints",
            "stalenessTimeoutSeconds": 300 // (number) optional: discard MQTT setpoints if no message received within this many seconds
        }
    }
    ...
}
````

### Staleness Timeout

If `stalenessTimeoutSeconds` is configured, MQTT setpoints act as a dead-man's switch: if no new MQTT message is received within the timeout period, all MQTT setpoint values are discarded and the system falls back to fixed setpoints.

This protects against external automation tools crashing or losing connectivity — without it, the last MQTT message persists indefinitely, potentially leaving the system in an unintended state (e.g., grid charging left enabled).

When a new MQTT message arrives after a staleness expiry, MQTT control resumes immediately.

> [!TIP]
> If not configured, the existing behavior is preserved: the last MQTT message persists indefinitely.

### MQTT Message Schema

The MQTT topic must contain a JSON message that meets the following schema

```jsonc
{
    // Schema:
    // opModConnect: boolean (optional)
    // opModEnergize: boolean (optional)
    // opModExpLimW: number (optional)
    // opModGenLimW: number (optional)
    // opModImpLimW: number (optional)
    // opModLoadLimW: number (optional)
    //
    // Battery control parameters (requires inverterControl.batteryPowerFlowControl: true):
    // batterySocTargetPercent: number (optional)
    // batterySocMinPercent: number (optional)
    // batterySocMaxPercent: number (optional)
    // batteryChargeMaxWatts: number (optional)
    // batteryDischargeMaxWatts: number (optional)
    // batteryPriorityMode: "battery_first" | "export_first" (optional)
    // batteryGridChargingEnabled: boolean (optional)
    // batteryGridChargingMaxWatts: number (optional)
    // batteryExportTargetWatts: number (optional) - site-level export target in watts; battery fills what PV doesn't cover
}
```

### Example: Basic Limits

```jsonc
{
    // MQTT control payload for inverter operating mode / limits.
    // All fields are optional: omit fields you are not setting.
    //
    // Units:
    // - *LimW fields are watts (W)
    // - opModConnect/opModEnergize are booleans
    //
    // Typical intent (aligning with earlier docs):
    // - opModConnect: connect/disconnect inverter (or enable/disable grid connection mode)
    // - opModEnergize: energize/enable inverter operation
    // - opModGenLimW: generation limit (W)
    // - opModExpLimW: export limit (W)
    // - opModImpLimW: import limit (W)
    // - opModLoadLimW: load limit (W)

    "opModConnect": true,
    "opModEnergize": true,
    "opModExpLimW": 0,
    "opModGenLimW": 5000,
    "opModImpLimW": 3000,
    "opModLoadLimW": 3500,
}
```

### Example: Battery Control via MQTT

```js
{
    "opModExpLimW": 0,
    "batterySocTargetPercent": 100,
    "batteryPriorityMode": "battery_first",
    "batteryChargeMaxWatts": 5000,
    "batteryDischargeMaxWatts": 3000
}
```

> [!NOTE]
> Battery control parameters allow dynamic battery management via MQTT. This enables integration with home automation, VPP programs, and time-of-use optimization. See [Battery Configuration](./battery.md) for more details.

## Negative feed-in

To set a zero export limit setpoint based on negative feed-in, add the following property to `config.json`

For Amber Electric:

```jsonc
{
    "setpoints": {
        "negativeFeedIn": {
            "type": "amber", // (string) required: the source of the negative feed-in data
            "apiKey": "asdf", // (string) required: the Amber API key
            "siteId": "12345" // (string) optional: the Amber site ID. If not supplied, it will automatically select the first site in the account (will error if there are multiple sites)
        }
    }
    ...
}
```

## Two-way tariffs

To set a zero export limit setpoint based on two-way tariffs, add the following property to `config.json`

For [Ausgrid solar tariff](https://www.ausgrid.com.au/Connections/Solar-and-batteries/Solar-tariffs) EA029:

```jsonc
{
    "setpoints": {
        "twoWayTariff": {
            "type": "ausgridEA029"
        }
    }
    ...
}
```

For [SAPN RELE2W](https://www.sapowernetworks.com.au/public/download.jsp?id=328119) tariff:

```jsonc
{
    "setpoints": {
        "twoWayTariff": {
            "type": "sapnRELE2W"
        }
    }
    ...
}
```
