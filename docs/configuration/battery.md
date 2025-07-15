# Battery

An **optional** battery can be configured to adjust the controller behaviour.

[[toc]]

## Charge buffer

In export limited scenarios, a "solar soaking" battery may not be able to charge correctly if the export limit is very low or zero. To allow the battery to charge, a minimum charge buffer can be configured which will override the export limit if it is below the configured watts.

To configure a charge buffer, add the following property to `config.json`

```js
{
    "battery": {
        "chargeBufferWatts": 100 // (number) required: the minimum charge buffer in watts
    }
    ...
}
```

> [!IMPORTANT]
> Users on dynamic export connections MUST NOT set a high charge buffer which may violate your connection agreement for dynamic export limits.

**Why doesn't the controller know if the battery is charged?**

Since the controller does not have direct control of batteries (especially batteries without an API e.g. Tesla Powerwall), it is not possible to know if the battery is configured for charging. Even if the battery SOC is known, it is possible the battery may be configured with a lower SOC cap or VPP mode which overrides the charging behaviour.