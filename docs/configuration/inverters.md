# Inverters

One or more inverters can be configured to measure the site's generation measurements (real power, reactive power, voltage, frequency) and control the power output.

[[toc]]

## SMA

SMA inverters support [SMA Modbus protocol](https://www.sma.de/en/products/product-features-interfaces/modbus-protocol-interface), however the register map differs across models.

### config.json

To configure a SMA inverter connection, add the following property to `config.json`

```js
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
            "unitId": 1 // (number) required: the Modbus unit ID of the inverter,
            "pollingIntervalMs":  // (number) optional: the polling interval in milliseconds, default 200
        }
    ],
    ...
}
```

## SunSpec

The SunSpec Modbus protocol is a widely adopted standard for communication for solar inverters. The protocol supports TCP, RTU and other transport layers. Compatibility is not well documented across inverter brands and models.

The project requires SunSpec models `1`, `101` (or `102` or `103`), `120`, `121`, `122`, `123` to be supported.

### config.json

To configure a SunSpec inverter connection over TCP, add the following property to `config.json`

```js
{
    "inverters": [ // (array) required: list of inverters
        {
            "type": "sunspec", // (string) required: the type of inverter
            "connection": {
                "type": "tcp", // (string) required: the type of connection (tcp, rtu)
                "ip": "192.168.1.6", // (string) required: the IP address of the inverter
                "port": 502 // (number) required: the Modbus TCP port of the inverter
            },
            "unitId": 1 // (number) required: the Modbus unit ID of the inverter,
            "pollingIntervalMs":  // (number) optional: the polling interval in milliseconds, default 200
        }
    ],
    ...
}
```

For SunSpec over RTU, you need to modify the `connection`

```js
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

```js
{
    "inverters": [
        {
            "type": "mqtt", // (string) required: the type of inverter
            "host": "mqtt://192.168.1.2", // (string) required: the MQTT broker host
            "username": "user", // (string) optional: the MQTT broker username
            "password": "password", // (string) optional: the MQTT broker password
            "topic": "inverters/1" // (string) required: the MQTT topic to read
            "pollingIntervalMs":  // (number) optional: the polling interval in milliseconds, default 200
        }
    ]
    ...
}
```

The MQTT topic must contain a JSON message that meets the following schema

```js
z.object({
    inverter: z.object({
        /**
         * Positive values = inverter export (produce) power
         *
         * Negative values = inverter import (consume) power
         *
         * Value is total (net across all phases) measurement
         */
        realPower: z.number(),
        /**
         * Positive values = inverter export (produce) power
         *
         * Negative values = inverter import (consume) power
         *
         * Value is total (net across all phases) measurement
         */
        reactivePower: z.number(),
        // Voltage of phase A (null if not available)
        voltagePhaseA: z.number().nullable(),
        // Voltage of phase B (null if not available)
        voltagePhaseB: z.number().nullable(),
        // Voltage of phase C (null if not available)
        voltagePhaseC: z.number().nullable(),
        frequency: z.number(),
    }),
    nameplate: z.object({
        /**
         * Type of DER device Enumeration
         *
         * PV = 4,
         * PV_STOR = 82,
         */
        type: z.nativeEnum(DERTyp),
        // Maximum active power output in W
        maxW: z.number(),
        // Maximum apparent power output in VA
        maxVA: z.number(),
        // Maximum reactive power output in var
        maxVar: z.number(),
    }),
    settings: z.object({
        // Currently set active power output in W
        maxW: z.number(),
        // Currently set apparent power output in VA
        maxVA: z.number().nullable(),
        // Currently set reactive power output in var
        maxVar: z.number().nullable(),
    }),
    status: z.object({
        // DER OperationalModeStatus value:
        // 0 - Not applicable / Unknown
        // 1 - Off
        // 2 - Operational mode
        // 3 - Test mode
        operationalModeStatus: z.nativeEnum(OperationalModeStatusValue),
        // DER ConnectStatus value (bitmap):
        // 0 - Connected
        // 1 - Available
        // 2 - Operating
        // 3 - Test
        // 4 - Fault / Error
        genConnectStatus: connectStatusValueSchema,
    }),
})
```

For example

```json
{
    "inverter": {
        "realPower": 4500,
        "reactivePower": 1500,
        "voltagePhaseA": 230.5,
        "voltagePhaseB": null,
        "voltagePhaseC": null,
        "frequency": 50.1
    },
    "nameplate": {
        "type": 4,
        "maxW": 5000,
        "maxVA": 5000,
        "maxVar": 5000
    },
    "settings": {
        "maxW": 5000,
        "maxVA": 5000,
        "maxVar": 5000
    },
    "status": {
        "operationalModeStatus": 2,
        "genConnectStatus": 7
    }
}
```