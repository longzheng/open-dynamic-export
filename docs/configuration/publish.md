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

The MQTT topic will contain a JSON message that meets the following Zod schema

```ts
const inverterControlTypesSchema = z.union([
  z.literal("fixed"),
  z.literal("mqtt"),
  z.literal("sep2"),
  z.literal("twoWayTariff"),
  z.literal("negativeFeedIn")
])

const activeInverterControlLimitSchema = z.object({
  opModEnergize: z.union([
    z.object({
      value: z.boolean(),
      source: inverterControlTypesSchema
    }),
    z.undefined()
  ]),
  opModConnect: z.union([
    z.object({
      value: z.boolean(),
      source: inverterControlTypesSchema
    }),
    z.undefined()
  ]),
  opModGenLimW: z.union([
    z.object({
      value: z.number(),
      source: inverterControlTypesSchema
    }),
    z.undefined()
  ]),
  opModExpLimW: z.union([
    z.object({
      value: z.number(),
      source: inverterControlTypesSchema
    }),
    z.undefined()
  ]),
  opModImpLimW: z.union([
    z.object({
      value: z.number(),
      source: inverterControlTypesSchema
    }),
    z.undefined()
  ]),
  opModLoadLimW: z.union([
    z.object({
      value: z.number(),
      source: inverterControlTypesSchema
    }),
    z.undefined()
  ])
})
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