# BOQ Uncertainty Ranges Design

**Date:** 2026-02-27
**Scope:** `boq_app.py` multi-sector Streamlit app

## Problem
The app prices BOQ items at a single point estimate, which hides pricing uncertainty and reduces risk visibility for multi-industry tenders.

## Goals
- Add per-item uncertainty ranges (low/high percentages).
- Compute min/base/max unit rates and amounts.
- Support trade-level default uncertainty ranges with per-item override.
- Add tender-level risk metrics and practical guardrails.

## Non-Goals
- Monte Carlo simulation.
- External market index integrations.
- Workflow redesign outside existing BOQ table flow.

## Approach
1. Add uncertainty defaults by trade/sector in `sectors.py`.
2. Extend BOQ row schema with `Unc_Low_pct` and `Unc_High_pct`.
3. Add risk outputs: `Rate_Min_U`, `Rate_Base_U`, `Rate_Max_U`, `Amount_Min`, `Amount_Base`, `Amount_Max`.
4. Add confidence presets (`High`, `Medium`, `Low`) to quickly set range widths.
5. Add warnings for invalid uncertainty configuration and highlight high-spread rows.

## Data Flow
- BOQ row edited/uploaded.
- Base unit rate is computed from components + OH + markup (existing behavior).
- Uncertainty percentages are applied to base unit rate.
- Quantity multiplies each scenario rate for amount scenarios.
- Summary aggregates min/base/max totals and risk spread.

## Error Handling and Guardrails
- Clamp scenario rates to non-negative values.
- Warn on invalid band direction (`low > 0`, `high < 0`).
- Warn on overly wide band (configurable threshold in app).
- Skip invalid numeric inputs defensively (coerce to float defaults).

## Testing Strategy
- Unit tests for uncertainty functions:
  - normal range computation
  - clamping behavior
  - confidence presets
  - invalid band detection
- Run existing tests to verify no regressions.

## Success Criteria
- Users can set uncertainty at item level with optional trade defaults.
- BOQ displays min/base/max rate and amount columns.
- Tender summary includes base/min/max and spread.
- Tests pass and app runs locally.
