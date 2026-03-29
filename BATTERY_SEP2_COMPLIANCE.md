# Battery Control SEP2 Compliance Review

**Branch**: `cpuid-inverter-control-battery-take2`
**Reviewed against**: SEP2 Client Handbook (CSIP-AUS Utility Interconnection Handbook), Document ID 13436740, Release 7, 28/01/2026
**Date**: 2026-03-29

---

## Breaches

### 1. Site Export Limit (`opModExpLimW`) — HIGH

**Handbook reference**: Section 5.1 — _"An export limit represents the maximum amount of power that can be exported to the grid. It is measured at the connection point."_

**Issue**: Battery discharge is additive to PV surplus and can exceed the export limit at the connection point.

`batteryPowerFlowCalculator.ts` produces a limit-aware `targetExportWatts` output (capped to `exportLimitWatts`), but `inverterController.ts` discards it — it only consumes `targetBatteryPowerWatts`, `batteryMode`, and `targetSolarWatts`. The battery `OutWRte` register is written independently of whether PV is already exporting up to the limit.

**Evidence**: The test suite validates this scenario explicitly — 8000W PV surplus + 3000W battery discharge = 11000W total export against a 10000W limit (`batteryPowerFlowCalculator.test.ts` lines ~898-924).

**Fix direction**: After computing `batteryFlowResult`, reduce battery discharge power so that `(currentSiteExport + batteryDischargePower) <= opModExpLimW`. Alternatively, consume the `targetExportWatts` output and derive battery discharge from it.

---

### 2. Emergency / Zero Export DOE — HIGH

**Handbook reference**: Section 7.2 — Systems may be reduced to 0 kW Export Limit (Emergency DOE). Section 4 — _"Installations with dynamic connection agreements must therefore have the necessary equipment to accurately measure and control flows at the connection point in accordance with the dynamic operating envelope for the site."_

**Issue**: When `opModExpLimW = 0` and `batteryExportTargetWatts > 0`, the battery is still commanded to discharge via SunSpec `InWRte`/`OutWRte`. PV is correctly curtailed to 0W, but battery discharge has no backstop and will export to grid against a zero-export limit.

**Fix direction**: When `opModExpLimW = 0`, battery discharge must be suppressed entirely (set `OutWRte = 0` or switch to charge/idle mode). More generally, battery discharge should be clamped to `max(0, opModExpLimW - currentPvExport)`.

---

### 3. Site Import Limit (`opModImpLimW`) — MEDIUM

**Handbook reference**: Section 5.2 — _"loads under a dynamic connection agreement may only consume while the site import limit is not being exceeded."_ Figure 1 shows BESS as an "Actively Managed Device" subject to site limits.

**Issue**: `opModImpLimW` is collected from setpoints and merged in `getActiveInverterControlLimit()` but is **never consumed** in `calculateInverterConfiguration()`. Grid charging via `batteryGridChargingMaxWatts` draws power with no comparison to the DOE import limit. House load + battery charging can exceed `opModImpLimW`.

**Fix direction**: Pass `opModImpLimW` into `batteryPowerFlowCalculator`. Clamp grid charge power so that `(currentSiteImport + gridChargePower) <= opModImpLimW`.

---

### 4. Load Limit (`opModLoadLimW`) — MEDIUM

**Handbook reference**: Section 5.4 — _"a load limit can also be specified to limit the amount of behind-the-meter load by managed DER. This limit does not apply to loads that aren't managed by the dynamic connection agreement."_

**Issue**: `opModLoadLimW` is collected but never enforced. Battery charging is a managed DER load and should be constrained by this limit.

**Fix direction**: Pass `opModLoadLimW` into the battery control path. Clamp battery charge power to `opModLoadLimW` when set.

---

## No Breach

| Rule | Handbook Section | Status |
|------|-----------------|--------|
| Generation Limit (`opModGenLimW`) | 5.3 | `targetSolarWatts` is clamped to `generationLimitWatts` in `inverterController.ts` |
| Disconnect Signal (`opModConnect` / `opModEnergize`) | 5.5 | Battery control is skipped when `disconnect = true`; function returns `{ type: 'disconnect' }` |
| Multiple DER coordination | 10.2 | System manages PV + BESS via single SEP2 client as per Figure 3 |
| Ramping | N/A | Conservative (undershoots toward target), does not temporarily overshoot limits |

---

## Root Cause

The core architectural issue is a disconnect between the calculator and its caller:

- `batteryPowerFlowCalculator` computes a limit-aware `targetExportWatts` output
- `inverterController.ts` ignores `targetExportWatts` and writes battery discharge (`OutWRte`) independently of what PV is already exporting
- `opModImpLimW` and `opModLoadLimW` are never passed into the battery control path at all

## Key Files

- `src/coordinator/helpers/batteryPowerFlowCalculator.ts` — battery power flow logic
- `src/coordinator/helpers/inverterController.ts` — orchestrates limits and writes inverter commands
- `src/inverter/sunspec/index.ts` — writes SunSpec registers (Model 124 storage)
- `src/coordinator/helpers/derSample.ts` — DER sample with battery metrics
