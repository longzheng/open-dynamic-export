# Site meter

One site meter can be configured to measure the site's import/export measurements (real power, reactive power, voltage, frequency).

[[toc]]

## MQTT

A MQTT topic can be read to get the site's import/export measurements.

To configure a MQTT meter connection, add the following property to `config.json`

```js
{
    "meter": {
        "type": "mqtt", // (string) required: the type of meter
        "host": "mqtt://192.168.1.2", // (string) required: the MQTT broker host
        "username": "user", // (string) optional: the MQTT broker username
        "password": "password", // (string) optional: the MQTT broker password
        "topic": "site" // (string) required: the MQTT topic to read
    }
    ...
}
```
## SMA

SMA inverters support [SMA Modbus protocol](https://www.sma.de/en/products/product-features-interfaces/modbus-protocol-interface), however the register map differs across models.

### config.json

To configure a SMA inverter with meter connection, add the following property to `config.json`

```js
{
    "meter": {
        "type": "sunspec", // (string) required: the type of meter
        "model": "core1", // (string) required: the model of the inverter
        "connection": {
            "type": "tcp", // (string) required: the type of connection (tcp, rtu)
            "ip": "192.168.1.6", // (string) required: the IP address of the inverter
            "port": 502 // (number) required: the Modbus TCP port of the inverter
        },
        "unitId": 240 // (number) required: the SunSpec unit ID of the meter
        "location": "feedin" // (string) optional: the location of the meter (feedin or consumption)
    }
    ...
}
```

## SunSpec

The SunSpec Modbus protocol is a widely adopted standard for communication for solar inverters. The protocol supports TCP, RTU and other transport layers. Compatibility is not well documented across inverter brands and models. 

Inverters that have an integrated meter may expose a meter via the SunSpec models as well.

The project requires SunSpec models `1`, `201` (or `202`, `203`) to be supported.

### config.json

To configure a SunSpec meter connection over TCP, add the following property to `config.json`

```js
{
    "meter": {
        "type": "sunspec", // (string) required: the type of meter
        "connection": {
            "type": "tcp", // (string) required: the type of connection (tcp, rtu)
            "ip": "192.168.1.6", // (string) required: the IP address of the inverter
            "port": 502 // (number) required: the Modbus TCP port of the inverter
        },
        "unitId": 240 // (number) required: the SunSpec unit ID of the meter
        "location": "feedin" // (string) optional: the location of the meter (feedin or consumption)
    }
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

The `location` property can be used to specify the location of the meter, which can be either `feedin` (measuring site import/export) or `consumption` (measuring site consumption). For consumption meters, the site measurements are derived by calculating the difference between generation and consumption values.

> [!WARNING]
> Sites with batteries does not support consumption meters due to the inability to measure battery power. The site meter must be installed in the feedin path.

### Fronius

To enable SunSpec/Modbus on Fronius inverters/meter, you'll need to access the inverter's local web UI and [enable the Modbus TCP option](https://github.com/longzheng/open-dynamic-export/wiki/Fronius-SunSpec-Modbus-configuration).

## Tesla Powerwall 2

Sites with a Tesla Powerwall 2 can use the Backup Gateway 2's meter and local API.

```js
    "meter": {
        "type": "powerwall2", // (string) required: the type of meter
        "ip": "192.168.1.68", // (string) required: the IP address of the Powerwall 2 Gateway
        "password": "ABCDE" // (string) required: the password to access the Powerwall 2 API (the last 5 characters of the password sticker)
    }
    ...
```