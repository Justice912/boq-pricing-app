# BOQ Compliance Guardrails Design

**Date:** 2026-02-27
**Scope:** `boq_app.py` multi-sector Streamlit app

## Goal
Add layered compliance checks for multi-industry BOQs with advisory-to-strict behavior: abnormal margin detection, unit mismatch warnings, and missing build-up flags.

## Decisions
- Baseline for abnormal margin: compare row OH/markup against trade defaults.
- Unit mismatch behavior: warn when BOQ unit differs from matched library unit after normalization.
- Approach: layered compliance engine with row checks + compliance dashboard + export sheet.

## Rule Set
- `markup_out_of_band`: row markup outside trade policy range.
- `overheads_out_of_band`: row overheads outside trade policy range.
- `unit_mismatch`: normalized BOQ unit != normalized matched library unit.
- `missing_cost_build_up`: priced row has weak rate build-up depth.

## Strictness Model
- `Advisory`: all findings = warning.
- `Standard`: unit mismatch + missing build-up = warning; both margin flags = warning.
- `Strict`: unit mismatch or missing build-up = critical; both margin flags = critical.

## UI and Reporting
- Sidebar controls:
  - Enable compliance checks
  - Strictness selector
- Row outputs:
  - `Compliance_Severity`
  - `Compliance_Flags`
  - `Margin_Anomaly_Score`
- Dashboard:
  - total flagged rows
  - critical rows
  - counts by flag type
  - top non-compliant rows table
- Export:
  - add `Compliance_Report` sheet.

## Architecture
- Create pure validation helpers in `compliance.py`.
- Add trade policies in `sectors.py`.
- Keep Streamlit wiring in `boq_app.py`; all decision logic delegated to helpers for testability.

## Test Strategy
- Unit tests for:
  - unit mismatch normalization
  - out-of-band margin detection
  - strictness severity escalation
  - missing build-up detection
- Regression checks:
  - existing uncertainty tests remain green
  - app starts successfully
