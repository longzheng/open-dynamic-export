# Publish

Optionally configure the active limits to be published to an external system.

[[toc]]

## MQTT

Write active limits to a MQTT topic.

To configure a MQTT output, add the following property to `config.json`

```js
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

```ts
type ActiveInverterControlLimit = {
    opModEnergize:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    opModConnect:
        | {
              value: boolean;
              source: InverterControlTypes;
          }
        | undefined;
    opModGenLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModExpLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModImpLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
    opModLoadLimW:
        | {
              value: number;
              source: InverterControlTypes;
          }
        | undefined;
};

type InverterControlTypes =
    | 'fixed'
    | 'mqtt'
    | 'sep2'
    | 'twoWayTariff'
    | 'negativeFeedIn';
```

For example

```js
{
    "opModEnergize": {
        "source": "sep2",
        "value": true
    },
    "opModConnect": {
        "source": "sep2",
        "value": true
    },
    "opModExpLimW": {
        "source": "sep2",
        "value": 1500
    },
    "opModImpLimW": {
        "source": "sep2",
        "value": 1500
    }
}
```