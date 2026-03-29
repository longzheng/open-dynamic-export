# Battery Control SEP2 Compliance Review

**Branch**: `cpuid-inverter-control-battery-take2`
**Reviewed against**: SEP2 Client Handbook (CSIP-AUS Utility Interconnection Handbook), Document ID 13436740, Release 7, 28/01/2026
**Date**: 2026-03-29

---

## Breaches Found and Fixed

### 1. Site Export Limit (`opModExpLimW`) — HIGH — FIXED

**Handbook reference**: Section 5.1 — _"An export limit represents the maximum amount of power that can be exported to the grid. It is measured at the connection point."_

**Issue**: Battery discharge was additive to PV surplus and could exceed the export limit at the connection point. The `batteryExportTargetWatts` setpoint was interpreted as "discharge this much from battery regardless of PV", meaning PV surplus + battery discharge could exceed `opModExpLimW`.

**Fix**: Redesigned `batteryExportTargetWatts` to use **gap-filling semantics**: PV surplus counts toward the export target, battery only discharges the difference. Additionally, battery export is hard-capped at `exportHeadroom = max(0, exportLimitWatts - pvSurplus)`, ensuring `(PV export + battery export) <= opModExpLimW` at all times.

---

### 2. Emergency / Zero Export DOE — HIGH — FIXED

**Handbook reference**: Section 7.2 — Systems may be reduced to 0 kW Export Limit (Emergency DOE).

**Issue**: When `opModExpLimW = 0` and `batteryExportTargetWatts > 0`, the battery was still commanded to discharge.

**Fix**: Handled automatically by the export headroom calculation: when `exportLimitWatts = 0`, `exportHeadroom = 0`, so `effectiveExportTarget = 0`. Battery can only discharge for self-consumption (covering house imports), which does not increase grid export.

---

### 3. Site Import Limit (`opModImpLimW`) — MEDIUM — FIXED

**Handbook reference**: Section 5.2 — _"loads under a dynamic connection agreement may only consume while the site import limit is not being exceeded."_ Figure 1 shows BESS as an "Actively Managed Device" subject to site limits.

**Issue**: `opModImpLimW` was collected but never passed to the battery calculator. Grid charging drew power with no comparison to the DOE import limit.

**Fix**: `importLimitWatts` is now passed from `inverterController.ts` to `batteryPowerFlowCalculator`. Grid charge power is capped at `importHeadroom = max(0, importLimitWatts - currentImport)`, ensuring `(house load + battery grid charging) <= opModImpLimW`.

---

## Out of Scope

### Load Limit (`opModLoadLimW`)

**Handbook reference**: Section 5.4 — _"a load limit can also be specified to limit the amount of behind-the-meter load by managed DER. This limit does not apply to loads that aren't managed by the dynamic connection agreement."_

Per the handbook, `opModLoadLimW` applies to specifically nominated managed loads (e.g., EVSE) under a dynamic connection agreement. ODE does not currently support discrete managed load control, and battery charging on hybrid inverters is not a separately managed load — it is part of the storage system's bidirectional power flow. Battery grid charging is already constrained by `opModImpLimW` at the site level.

---

## No Breach

| Rule | Handbook Section | Status |
|------|-----------------|--------|
| Generation Limit (`opModGenLimW`) | 5.3 | `targetSolarWatts` is clamped to `generationLimitWatts` in `inverterController.ts` |
| Disconnect Signal (`opModConnect` / `opModEnergize`) | 5.5 | Battery control is skipped when `disconnect = true`; function returns `{ type: 'disconnect' }` |
| Multiple DER coordination | 10.2 | System manages PV + BESS via single SEP2 client as per Figure 3 |
| Ramping | N/A | Conservative (undershoots toward target), does not temporarily overshoot limits |

---

## Key Files

- `src/coordinator/helpers/batteryPowerFlowCalculator.ts` — battery power flow logic (gap-filling + DOE capping)
- `src/coordinator/helpers/inverterController.ts` — orchestrates limits, wires `importLimitWatts` through
- `src/inverter/sunspec/index.ts` — writes SunSpec registers (Model 124 storage)
