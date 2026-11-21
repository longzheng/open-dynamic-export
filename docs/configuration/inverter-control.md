# Inverter control

To help test and validate integrations, the project can be configured whether to send control commands to the inverters using the `config.json` option `inverterControl.enabled` can be used to enable or disable inverter control.

```jsonc
{
    "inverterControl": {
        "enabled": true // (true/false) optional: whether the inverters should be controlled based on limits, turn off to simulate
    },
    ...
}
```

## Battery control

The project supports comprehensive battery control with SoC (state of charge) awareness, priority modes, and multi-inverter support. Battery control can be enabled globally and requires both global and per-inverter configuration.

```js
{
    "inverterControl": {
        "enabled": true,
        "batteryControlEnabled": true, // (true/false) optional: enable battery storage control
        "batteryPowerFlowControl": true // (true/false) optional: use intelligent power flow control
    },
    ...
}
```

### Configuration Options

| Parameter                 | Type    | Default | Description                                      |
| ------------------------- | ------- | ------- | ------------------------------------------------ |
| `batteryControlEnabled`   | boolean | false   | Enable battery control system globally           |
| `batteryPowerFlowControl` | boolean | false   | Use intelligent power flow control (recommended) |

> [!NOTE]
> See [Battery Configuration](./battery.md) for detailed information about battery control features, priority modes, SoC management, and configuration examples.

### Battery Power Flow Control vs Legacy Charge Buffer

The project provides two battery control mechanisms:

- **Battery Power Flow Control** (Recommended): Intelligent control with SoC awareness, configurable priority modes, and multi-inverter support
- **Legacy Charge Buffer**: Simple override ensuring minimum charging headroom

> [!IMPORTANT]
> These mechanisms are **mutually exclusive**. Configurations that attempt to use both `battery.chargeBufferWatts` and `inverterControl.batteryPowerFlowControl` simultaneously will be rejected.

See the [Battery Configuration Guide](./battery.md) for migration steps and detailed feature comparisons.

## Data sampling

The inverter control loop will attempt to aggregate and average a window of measurements to reduce the impact of noise and fluctuations. The `config.json` option `inverterControl.sampleSize` can be used to adjust the number of samples to average.

```jsonc
{
    "inverterControl": {
        "sampleSeconds": 5 // (number) optional: the number of seconds to sample for averaging
    },
    ...
}
```

## Frequency

The inverter control loop will attempt to control the inverter with a rate limit to prevent over-correcting and leading to osscilations. The `config.json` option `inverterControl.intervalSeconds` can be used to adjust the frequency in seconds.

The rate limit will be influenced by the latency of sending commands to the inverter (e.g. over WiFi) and the inverter's response time, so the frequency configuration is a minimum and not a guaranteed rate.

```jsonc
{
    "inverterControl": {
        "intervalSeconds": 5 // (number) optional: the frequency in seconds to control the inverter
    },
    ...
}
```
