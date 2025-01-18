# Publish

Optionally configure the active limits to be published to an external system.

[[toc]]

## REST API/OpenAPI

The active limits (and other metrics and configurations) can be accessed from the `http://<host>:3000/coordinator/status` "coordinator status" REST API.

You can access the API documentation/OpenAPI schema at `http://<host>:3000/docs`. The server port can be configured in the `.env` `SERVER_PORT`.

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
  z.literal("csipAus"),
  z.literal("fixed"),
  z.literal("mqtt"),
  z.literal("negativeFeedIn")
  z.literal("twoWayTariff"),
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
        "source": "csipAus",
        "value": true
    },
    "opModConnect": {
        "source": "csipAus",
        "value": true
    },
    "opModExpLimW": {
        "source": "csipAus",
        "value": 1500
    },
    "opModImpLimW": {
        "source": "csipAus",
        "value": 1500
    }
}
```