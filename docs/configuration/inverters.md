# Inverters

One or more inverters can be configured to measure the site's generation measurements (real power, reactive power, voltage, frequency) and control the power output.

[[toc]]

## SMA

SMA inverters support [SMA Modbus protocol](https://www.sma.de/en/products/product-features-interfaces/modbus-protocol-interface), however the register map differs across models.

### config.json

To configure a SMA inverter connection, add the following property to `config.json`

```jsonc
{
    "inverters": [ // (array) required: list of inverters
        {
            "type": "sma", // (string) required: the type of inverter
            "model": "core1", // (string) required: the model of the inverter
            "connection": {
                "type": "tcp", // (string) required: the type of connection (tcp, rtu)
                "ip": "192.168.1.6", // (string) required: the IP address of the inverter
                "port": 502 // (number) required: the Modbus TCP port of the inverter
            },
            "unitId": 1, // (number) required: the Modbus unit ID of the inverter,
            "pollingIntervalMs": 200 // (number) optional: the polling interval in milliseconds, default 200
        }
    ],
    ...
}
```

## SunSpec

The SunSpec Modbus protocol is a widely adopted standard for communication for solar inverters. The protocol supports TCP, RTU and other transport layers. Compatibility is not well documented across inverter brands and models.

The project requires SunSpec models `1`, `101` (or `102` or `103`), `120`, `121`, `122`, `123` to be supported.

For battery control, the inverter must also support SunSpec model `124` (Battery Storage).

### config.json

To configure a SunSpec inverter connection over TCP, add the following property to `config.json`

```jsonc
{
    "inverters": [ // (array) required: list of inverters
        {
            "type": "sunspec", // (string) required: the type of inverter
            "connection": {
                "type": "tcp", // (string) required: the type of connection (tcp, rtu)
                "ip": "192.168.1.6", // (string) required: the IP address of the inverter
                "port": 502 // (number) required: the Modbus TCP port of the inverter
            },
            "unitId": 1, // (number) required: the Modbus unit ID of the inverter,
            "pollingIntervalMs": 200, // (number) optional: the polling interval in milliseconds, default 200
            "batteryControlEnabled": false // (boolean) optional: enable battery control for this inverter, default false
        }
    ],
    ...
}
```

> [!NOTE]
> Battery control requires global `inverterControl.batteryControlEnabled` and per-inverter `batteryControlEnabled` to be set to `true`. The system will automatically detect if the inverter has battery storage capability via SunSpec Model 124. See [Battery Configuration](./battery.md) for more details.
```

For SunSpec over RTU, you need to modify the `connection`

```jsonc
            "connection": {
                "type": "rtu", // (string) required: the type of connection (tcp, rtu)
                "path": "/dev/ttyUSB0",  // (string) required: the path to the serial port
                "baudRate": 9600 // (number) required: the baud rate of the serial port
            },
```

### Fronius

To enable SunSpec/Modbus on Fronius inverters, you'll need to access the inverter's local web UI and [enable the Modbus TCP option](https://github.com/longzheng/open-dynamic-export/wiki/Fronius-SunSpec-Modbus-configuration).

## MQTT

> [!WARNING]
> The MQTT inverter configuration does not support control. It is designed for systems which will monitor the API or "publish" active limit output to apply inverter control externally.

A MQTT topic can be read to get the inveter measurements.

To configure a MQTT inverter connection, add the following property to `config.json`

```jsonc
{
    "inverters": [
        {
            "type": "mqtt", // (string) required: the type of inverter
            "host": "mqtt://192.168.1.2", // (string) required: the MQTT broker host
            "username": "user", // (string) optional: the MQTT broker username
            "password": "password", // (string) optional: the MQTT broker password
            "topic": "inverters/1", // (string) required: the MQTT topic to read
            "pollingIntervalMs": 200 // (number) optional: the polling interval in milliseconds, default 200
        }
    ]
    ...
}
```

The MQTT topic must contain a JSON message that meets the following schema

```jsonc
{
    "inverter": {
        // Positive values = inverter exporting (producing) real power.
        // Negative values = inverter importing (consuming) real power.
        // This is the total/net real power across all phases.
        "realPower": 1234.5,

        // Reactive power (var). Sign convention depends on the upstream system.
        "reactivePower": 120.0,

        // Per-phase voltages in volts.
        // Nullable because some devices/reporting modes don’t provide per-phase values.
        "voltagePhaseA": 230.4,
        "voltagePhaseB": null,
        "voltagePhaseC": null,

        // Grid frequency in Hz.
        "frequency": 50.0,
    },

    "nameplate": {
        // Type of DER device (enum).
        // Allowed numeric values:
        // - 4  = PV (solar)
        // - 82 = PV_STOR (solar + storage)
        "type": 4,

        // Device nameplate limits (capability ratings).
        "maxW": 5000,
        "maxVA": 5500,
        "maxVar": 2000,
    },

    "settings": {
        // Currently configured export/production limit in watts.
        "maxW": 5000,

        // Optional configured limits; null if not set / not supported.
        "maxVA": null,
        "maxVar": null,
    },

    "status": {
        // Operational mode status (enum).
        // Allowed numeric values:
        // - 0 = Not applicable / Unknown
        // - 1 = Off
        // - 2 = Operational mode
        // - 3 = Test mode
        "operationalModeStatus": 2,

        // Connection / availability / operating state bitmap (bitwise enum).
        // This is an integer whose bits may be combined:
        // - (1 << 0) = 1  => Connected
        // - (1 << 1) = 2  => Available
        // - (1 << 2) = 4  => Operating
        // - (1 << 3) = 8  => Test
        // - (1 << 4) = 16 => Fault / Error
        //
        // Example: 1 + 2 + 4 = 7 means Connected + Available + Operating.
        "genConnectStatus": 7,
    },
}
```
