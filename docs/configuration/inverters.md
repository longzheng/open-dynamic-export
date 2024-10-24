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
            "unitId": 1 // (number) required: the Modbus unit ID of the inverter
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
            "unitId": 1 // (number) required: the Modbus unit ID of the inverter
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
