# Getting started

## Introduction

*Open Dynamic Export* is a Node/TypeScript project implementing dynamic export control/solar curtailment of inverters. It aims to solve these use cases:
- dynamic connection requirements (CSIP-AUS/SEP2/IEEE 2030.5) of various Australian energy distributors (DNSPs)
- fixed/zero export limitations (e.g. 1.5kW export limit)
- two-way tariffs (e.g.time based) export limitation
- negative feed-in (e.g. Amber) export limitation

## Architecture

```mermaid
flowchart LR
    ODE(("open-dynamic-export"))
    I["Inverter(s)"]
    M["Site meter"]

    CSIP-AUS --> DC
    DC & F & T & NFI & MQTTL --> ODE
    Configuration --> F
    A["Amber API"] --> NFI
    R["Tariff rules"] --> T
    ODE <--> SunSpec & Modbus & HTTP & Proprietary & MQTT
    Protocols <--> I & M

    subgraph Setpoints
    DC["Dynamic exports"]
    F["Fixed/zero export"]
    T["Two-way tariffs"]
    NFI["Negative feed-in"]
    MQTTL["MQTT"]
    end

    subgraph Protocols
    SunSpec
    Modbus["Modbus TCP/RTU"]
    HTTP
    MQTT
    Proprietary
    end
```

### Setpoints
The system uses one or more "setpoints" to set the operating envelope of the site. All setpoints are restrictive, that is a combination of multiple setpoints will evaluate all setpoints and enforce the most prohibitive value of each control type at any one time. [Learn more about configuring setpoints](/configuration/setpoints).

### Inverters
The system supports one or more inverters to measure the site's generation metrics and control the power output. [Learn more about configuring inverters](/configuration/inverters).

### Site meter
The system supports one site meter to measure the site's load and export metrics. [Learn more about configuring site meter](/configuration/meter).

## Install

1. Clone Git repo

2. Copy `.env.example` and rename it to `.env` and change the values to suit your environment

3. In the `/config` folder, make a copy of the `config.example.json` file and rename it to `config.json`. Update it with the relevant values, see the "Configuration" section for more details.

Use Node or Docker to run the project.

### Node
You can run the Node project directly with the Node.js runtime.

1. Install dependencies with `npm install`

2. Build the project with `npm run build`

3. Run the project with `npm start`

### Docker compose

1. Run `docker compose up -d` to use from the [Docker Hub image](https://hub.docker.com/r/longzhengau/open-dynamic-export) (optionally run `docker compose up -d --build` to build the image from the source code)

2. Optionally uncomment the `influxdb` service in the `docker-compose.yml` file to enable logging to InfluxDB

### Web UI
You can view the dashboard at `http://localhost:3000` (or the server port you specified in the `.env` file).

![Dashboard UI](/dashboard.png)
