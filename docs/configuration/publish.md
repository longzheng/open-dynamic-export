# Publish

Optionally configure the active limits to be published to an external system.

[[toc]]

## REST API/OpenAPI

The active limits (and other metrics and configurations) can be accessed from the `http://<host>:3000/coordinator/status` "coordinator status" REST API.

You can access the API documentation/OpenAPI schema at `http://<host>:3000/docs`. The server port can be configured in the `.env` `SERVER_PORT`.

## MQTT

Write active limits to a MQTT topic.

To configure a MQTT output, add the following property to `config.json`

```jsonc
{
    "publish": {
        "mqtt": {
            "host": "mqtt://192.168.1.2", // (string) required: the MQTT broker host
            "username": "user", // (string) optional: the MQTT broker username
            "password": "password", // (string) optional: the MQTT broker password
            "topic": "limits" // (string) required: the MQTT topic to write
        }
    }
    ...
}
```

The MQTT topic will contain a JSON message that meets the following schema

```jsonc
{
    // Active inverter control limits currently in effect.
    //
    // Each field is either:
    //   - undefined (no active control / not currently applied), OR
    //   - an object { value: <boolean|number>, source: <InverterControlTypes> }
    //
    // InverterControlTypes:
    //   "fixed" | "mqtt" | "csipAus" | "twoWayTariff" | "negativeFeedIn" | "batteryChargeBuffer"

    // Energize / enable inverter operation.
    "opModEnergize": {
        "value": true,
        "source": "csipAus",
    },

    // Connect/disconnect inverter to/from grid (or enable grid connection mode).
    "opModConnect": {
        "value": true,
        "source": "fixed",
    },

    // Generation limit in watts (W).
    "opModGenLimW": {
        "value": 5000,
        "source": "twoWayTariff",
    },

    // Export limit in watts (W).
    "opModExpLimW": {
        "value": 0,
        "source": "negativeFeedIn",
    },

    // Import limit in watts (W).
    "opModImpLimW": undefined,

    // Load limit in watts (W).
    "opModLoadLimW": {
        "value": 3000,
        "source": "batteryChargeBuffer",
    },
}
```
