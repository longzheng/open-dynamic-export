# Setpoints

One or more setpoints can be configured to set the operating envelope of the site. 

All setpoints are restrictive, that is a combination of multiple setpoints will evaluate all setpoints and enforce the most prohibitive value of each control type at any one time.

[[toc]]


## Control modes

The software supports 6 control modes mapped to the CSIP-AUS Dynamic Operating Envelope (DOE) modes.

| Mode            | Description                                                                                    | Overlap resolution     | Default value |
|-----------------|------------------------------------------------------------------------------------------------|------------------------|---------------|
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

```js
{
    "setpoints": {
        "csipAus": {
            "host": "https://sep2-test.energyq.com.au", // (string) required: the CSIP-AUS server host
            "dcapUri": "/api/v2/dcap", // (string) required: the device capability discovery URI
            "nmi": "1234567890" // (string) optional: for utilities that require in-band registration, the NMI of the site
        }
    }
    ...
}
```

The `nmi` is not required for Energex/Ergon Energy/Energy Queensland.

## Fixed limit

To use a setpoint to specify fixed limits (such as for fixed export limits), add the following property to `config.json`

```js
{
    "setpoints": {
        "fixed": {
            "connect": true, // (true/false) optional: whether the inverters should be connected to the grid
            "exportLimitWatts": 5000, // (number) optional: the maximum export limit in watts
            "generationLimitWatts": 10000, // (number) optional: the maximum generation limit in watts
            "importLimitWatts": 5000, // (number) optional: the maximum import limit in watts (not currently used)
            "loadLimitWatts": 10000 // (number) optional: the maximum load limit in watts (not currently used)
        }
    }
    ...
}
```

## MQTT

To specify setpoint limits based on a MQTT topic, add the following property to `config.json`

```js
{
    "setpoints": {
        "mqtt": {
            "host": "mqtt://192.168.1.123",
            "topic": "setpoints"
        }
    }
    ...
}
```

The MQTT topic must contain a JSON message that meets the following schema

```js
z.object({
    opModConnect: z.boolean().optional(),
    opModEnergize: z.boolean().optional(),
    opModExpLimW: z.number().optional(),
    opModGenLimW: z.number().optional(),
    opModImpLimW: z.number().optional(),
    opModLoadLimW: z.number().optional(),
});
```

For example

```js
{
    "opModEnergize": true,
    "opModExpLimW": 5000,
    "opModGenLimW": 10000
}
```

## Negative feed-in

To set a zero export limit setpoint based on negative feed-in, add the following property to `config.json`

For Amber Electric:
```js
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
```js
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
```js
{
    "setpoints": {
        "twoWayTariff": {
            "type": "sapnRELE2W"
        }
    }
    ...
}
```
