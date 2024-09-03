<img src="https://github.com/user-attachments/assets/9a1ba915-410d-4349-a2ff-4d226aea0a88" width="500" alt="Logo" />

## About

This project aims to implement dynamic export control/solar curtailment of inverters using Node.js/TypeScript to satisfy
- dynamic connection requirements (CSIP-AUS/SEP2/IEEE 2030.5) of various Australian energy markets
- fixed/zero export limitations (e.g. 1.5kW export limit)
- negative feed-in (e.g. Amber)

## Supported inverters and meters

Inverters:
- One or more SunSpec Modbus TCP compatible solar inverter(s)
  - Tested with Fronius Primo and Fronius Symo

Meters:
- One or more SunSpec Modbus TCP compatible smart meter(s) 
  - Tested with Fronius Smart Meter and Catch Power Relay

> [!IMPORTANT]
> The application assumes the smart meter is configured as a feed-in or export/import meter installed at the grid connection to accurately measure the site export/import. Smart meters installed as consumption metering is not supported due to ambiguity if there are other loads or batteries that are not counted towards the site export/import.

## Running

### Configuration

The server uses a configuration JSON to configure how it works. All "limits" are restrictive, that is a combination of multiple limits will evaluate all limits and enforce the most prohibitive for each control (e.g. export = less export, generation = less generation, connection = de-energize) at any one time.

#### SunSpec

To configure the inverter and meter connections, add the following property to `config.json`

```js
{
    "sunSpec": {
        "control": true, // (true/false) optional: whether the inverters should be controlled based on limits, turn off to simulate
        "inverters": [ // (array) required: list of inverters
            {
                "ip": "192.168.1.6", // (string) required: the IP address of the inverter
                "port": 502, // (number) required: the Modbus TCP port of the inverter
                "unitId": 1 // (number) required: the Modbus unit ID of the inverter
            }
        ],
        "meters": [ // (array) optional: list of meters
            {
                "ip": "192.168.1.6", // (string) required: the IP address of the meter
                "port": 502, // (number) required: the Modbus TCP port of the meter
                "unitId": 240 // (number) required: the Modbus unit ID of the meter
            }
        ]
    }
    ...
}
```

#### Fixed limits

To set fixed limits (such as for fixed export limits), add the following property to `config.json`

```js
{
    "limit": {
        "connect": true, // (true/false) optional: whether the inverters should be connected to the grid
        "exportLimitWatts": 5000, // (number) optional: the maximum export limit in watts
        "generationLimitWatts": 10000 // (number) optional: the maximum generation limit in watts
    },
    ...
}
```

#### Negative feed-in

To set a zero export limit based on negative feed-in, add the following property to `config.json`

For Amber Electric:
```js
{
    "negativeFeedIn": {
        "type": "amber", // (string) required: the source of the negative feed-in data
        "apiKey": "asdf", // (string) required: the Amber API key
        "siteId": "12345" // (string) required: the Amber site ID
    },
    ...
}
```

#### CSIP-AUS

> [!IMPORTANT]
> This CSIP-AUS client cannot run without device certificates (and manufacturer certificates issued by the utility server which must be manually registered) and is not provided in this repository. A future version of this application will support a self-service device registration process.

To use CSIP-AUS, add following property to `config.json`

```js
{
    "sep2": {
        "host": "https://sep2-test.energyq.com.au", // (string) required: the SEP2 server host
        "dcapUri": "/api/v2/dcap" // (string) required: the device capability discovery URI
    },
    ...
}
```

### Docker compose

1. Clone repo

1. Copy `.env.example` and rename it to `.env` and change the values to suit

1. Create a `/config` folder and copy the [`config.example.json` file from the repo](https://github.com/longzheng/open-dynamic-export/blob/main/config/config.example.json) and rename it to `config.json`. Set it with the required values.

1. Run `docker-compose up -d`

## CSIP-AUS client

The project implements a CSIP-AUS compatible client that interacts with the utility server (SEP2 server). The initial implementation focuses on the Energy Queensland requirements as outlined in the [SEP2 Client Handbook published by Energy Queensland](https://www.energex.com.au/__data/assets/pdf_file/0007/1072618/SEP2-Client-Handbook-13436740.pdf).

```mermaid
sequenceDiagram
    participant U as Utility<br>(SEP2 server)
    participant SC as SEP2 client
    participant C as Coordinator
    participant MC as SunSpec client
    participant D as DER<br>(SunSpec compatible device)

    loop
    SC->>U: SEP2 discovery
    U->>SC: Devices, programs, DER controls
    SC->>U: Acknowledge DER controls
    end

    SC->>C: Control schedules<br> and limits

    loop
    MC->>D: Read Modbus registers
    D->>MC: Inverter metrics
    end

    MC->>C: PV power, load power<br>and site power flow

    Note over C: Get current schedule<br>Calculate target power level<br>to meet limits

    C-->>MC: Inverter controls

    MC->>D: Write Modbus registers

    loop
    SC->>U: Send DER status/capability/settings
    SC->>U: Send site and DER telemetry
    end

    box rgb(198,239,210) open-dynamic-export
    participant SC
    participant MC
    participant C
    end
```

The initial plan is to implement a direct gateway client that interacts directly with the utility server and the DER (solar inverters). This client will be hosted on-site (e.g. home server/Raspberry Pi) using a Docker container and communicate directly with DER in the same local network using Modbus TCP.

The downside of a direct client approach is the registration process is manual and requires generating keys and certificates for each site/NMI. If the project is successful, a future version will allow self-service registration or a cloud-hosted aggregator proxy.

## Features

- [x] Limits control
  - [x] Fixed limits
  - [ ] Dynamic negative feed-in via Amber API
- [x] Inverter integration
  - [x] SunSpec Modbus TCP
- [x] Meter integration
  - [x] SunSpec Modbus TCP
  - [ ] Tesla Powerwall
- [x] CSIP-AUS/SEP2/IEEE 2030.5 client
  - [x] Discovery and scheduled entity polling
  - [x] DER status/capability/settings reporting
  - [x] DER control scheduling and default DER control fallback
  - [x] Site/DER "mirror usage point" "mirror meter reading" reporting
- [x] Software-based `setGradW` ramping
- [x] Metrics logging in InfluxDB

Future
- [ ] CSIP-AUS self registration
- [ ] CSIP-AUS self-service certificate generation
- [ ] CSIP-AUS cloud aggregator proxy mode
- [ ] Web UI with real-time metrics and historical metrics
- [ ] Device package (plug and play solution)

## CSIP-AUS Private key and CSR

CSIP-AUS uses PKI certificates to authorise and identify clients.

As a direct client, there needs to be two certificates, one for the "manufacturer" and one for the "device". The "manufacturer" certificate needs to be signed by the utility Smart Energy Root CA (SERCA). Then the "device" certificate is signed with the "manufacturer" certificate & key.

To generate a device certificate key and certificate signing request.

```bash
npm run device-cert-request
```

For local testing, generate a valid self signed certificate using

```bash
openssl req -x509 -new -key key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/"
```

For live testing, generate a valid device certificate by signing it with the manufacturer certificate.

```bash
npm run device-cert-sign
```

To view the device certificate LFDI

```bash
npm run device-cert-lfdi
```

The manufacturer certificate is signed manually by the utility. The certificate key and certificate signing request can be generated with

```bash
openssl ecparam -name secp256r1 -genkey -noout -out mica_key.pem
openssl req -new -key mica_key.pem -out mica_cert_req.csr -sha256 -subj "/"
```

## Motivation

My parents living in Queensland have a solar PV system and was required to move to Energex's dynamic connection to install an Tesla Powerwal battery because the total inverter capacity was >10kVA. A requirement of the dynamic connection is the use of a "complaint provider" (SEP2 client/device) to manage the solar inverters to meet dynamic export rules.

I opted for the CATCH Power Solar Relay solution since it was already installed at the site (for hot water control) and I wanted to support an Australian company. Unfortunately my experience with their product was subpar due to confusing UIs and a buggy implementation of SunSpec which does not support daisy chained Fronius inverters. I spent considerable time debugging their Modbus implementation and I tried to contact them to help improve their product but they were quite arrogant and not interested in my feedback.

So I thought I should put my efforts on making a better product that is open source since I have an interest in energy markets and was curious about the SEP2/CSIP-AUS standards.

I got in touch with Energy Queensland who was surprisingly helpful (for a government agency) and was open to the idea of an open-source client.

## Resources

- [SEP2 Client Handbook published by Energy Queensland](https://www.energex.com.au/__data/assets/pdf_file/0007/1072618/SEP2-Client-Handbook-13436740.pdf)
- [IEEE 2030.5 standard](https://standards.ieee.org/ieee/2030.5/5897/)
- [IEEE 2030.5 Data Model](https://zepben.github.io/evolve/docs/2030-5/)
- [SEP2 Common Library](https://github.com/ethanndickson/sep2_common) Rust library
- [SEP2-Tools](https://github.com/aguinane/SEP2-Tools) Python library
- [Common Smart Inverter Profile - IEEE 2030.5 Implementation Guide for Smart Inverters v2.1](https://sunspec.org/wp-content/uploads/2019/08/CSIPImplementationGuidev2.103-15-2018.pdf)
- [Common Smart Inverter Profile – Australia v1.1a](https://arena.gov.au/assets/2021/09/common-smart-inverter-profile-australia.pdf)
- [Common Smart Inverter Profile - Australia - Test Procedures v1.0](https://bsgip.com/wp-content/uploads/2023/09/CSIP-AUS-Comms-Client-Test-Procedures-v1.0-final.pdf)
- [SA Power Networks - Dynamic Exports Test Procedure v1.2](https://www.talkingpower.com.au/71619/widgets/376925/documents/239206)
