# Inverter control

To help test and validate integrations, the project can be configured whether to send control commands to the inverters using the `config.json` option `inverterControl.enabled` can be used to enable or disable inverter control.

```js
{
    "inverterControl": {
        "enabled": true // (true/false) optional: whether the inverters should be controlled based on limits, turn off to simulate
    },
    ...
}
```

## Data sampling

The inverter control loop will attempt to aggregate and average a window of measurements to reduce the impact of noise and fluctuations. The `config.json` option `inverterControl.sampleSize` can be used to adjust the number of samples to average.

```js
{
    "inverterControl": {
        "sampleSeconds": 5 // (number) optional: the number of seconds to sample for averaging
    },
    ...
}
```

## Frequency

The inverter control loop will attempt to control the inverter with a rate limit to prevent over-correcting and leading to osscilations. The `config.json` option `inverterControl.controlFrequencyMinimumSeconds` can be used to adjust the frequency in seconds.

The rate limit will be influenced by the latency of sending commands to the inverter (e.g. over WiFi) and the inverter's response time, so the frequency configuration is a minimum and not a guaranteed rate.

```js
{
    "inverterControl": {
        "controlFrequencyMinimumSeconds": 5 // (number) optional: the frequency in seconds to control the inverter
    },
    ...
}
```
