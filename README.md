<img src="https://github.com/user-attachments/assets/9a1ba915-410d-4349-a2ff-4d226aea0a88" width="250" alt="Logo" />

## About

This project aims to implement dynamic export control/solar curtailment of inverters using Node.js/TypeScript to satisfy
- dynamic connection requirements (CSIP-AUS/SEP2/IEEE 2030.5) of various Australian energy distributors (DNSPs)
  - certified by SA Power Networks (1/10/2024)
- fixed/zero export limitations (e.g. 1.5kW export limit)
- two-way tariffs (e.g.time based) export limitation
- negative feed-in (e.g. Amber) export limitation

## Documentation
[View documentation](https://opendynamicexport.com/guide/)

## Features

- [x] Limits control
  - [x] Fixed limits
  - [x] Dynamic negative feed-in
  - [x] Two-way tariffs
  - [x] CSIP-AUS
- [x] Inverter integration
  - [x] SunSpec Modbus TCP
  - [x] SunSpec Modbus RTU
- [x] Meter integration
  - [x] SunSpec Modbus TCP
  - [x] SunSpec Modbus RTU
  - [x] Tesla Powerwall
- [x] CSIP-AUS/SEP2/IEEE 2030.5 client
  - [x] Discovery and scheduled entity polling
  - [x] ConnectionPoint in-band registration
  - [x] DER status/capability/settings reporting
  - [x] DER control scheduling and default DER control fallback
  - [x] Site/DER "mirror usage point" "mirror meter reading" reporting
  - [x] Software-based limit ramping (`setGradW` or `rampTms`)
- [x] Metrics logging in InfluxDB

## Build
### Docker compose

1. Clone repo

1. Copy `.env.example` and rename it to `.env` and change the values to suit

1. Create a `/config` folder and copy the [`config.example.json` file from the repo](https://github.com/longzheng/open-dynamic-export/blob/main/config/config.example.json) and rename it to `config.json`. Set it with the required values.

1. Run `docker compose up -d` (or run `docker compose up -d --build`)

## CSIP-AUS Private key and CSR

CSIP-AUS uses PKI certificates to authorise and identify clients.

As a direct client, there needs to be two certificates, one for the "manufacturer" and one for the "device". The "manufacturer" certificate needs to be signed by the utility Smart Energy Root CA (SERCA). Then the "device" certificate is signed with the "manufacturer" certificate & key.

To generate a device certificate key and certificate signing request.

```bash
npm run cert:device-request
```

For local testing, generate a valid self signed certificate using

```bash
openssl req -x509 -new -key key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/"
```

For live testing, generate a valid device certificate by signing it with the manufacturer certificate.

```bash
npm run cert:device-generate
```

To view the device certificate LFDI

```
http://localhost:3000/csipAus/id
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
