# Hybrid AI-Assisted Pricing Design

**Date:** 2026-02-27
**Scope:** `boq_app.py` multi-sector Streamlit app

## Goal
Add suggest-only AI-assisted pricing using hybrid logic: offline scoring first, configurable API provider fallback for low-confidence rows.

## Decisions
- Mode: Hybrid (`offline` first, API fallback).
- Provider strategy: Configurable provider interface, OpenAI first adapter.
- Application mode: Suggest-only; user explicitly accepts per row or bulk.

## Architecture
- `ai_pricing.py`:
  - deterministic offline suggestion from rate-library match + heuristics
  - fallback routing to provider if confidence below threshold and budget allows
  - no direct mutation of pricing columns unless accept action is called
- `ai_providers.py`:
  - provider interface + registry
  - OpenAI provider adapter (optional, key-driven)
- `boq_app.py`:
  - AI controls in sidebar
  - batch generate suggestions
  - accept per-row / accept all
  - surface confidence, source, rationale

## Data Model Additions per Row
- `AI_Proposed_Materials_Rate_U`
- `AI_Proposed_Labour_Rate_U`
- `AI_Proposed_Equipment_Rate_U`
- `AI_Proposed_Subcontract_Rate_U`
- `AI_Proposed_Overheads_pct`
- `AI_Proposed_Markup_pct`
- `AI_Confidence`
- `AI_Source` (`offline` | `api` | `none`)
- `AI_Rationale`

## Controls and Safety
- Sidebar:
  - Enable API fallback
  - Provider name
  - low-confidence threshold
  - max API calls per run
- Safety rules:
  - never overwrite current row rates without explicit accept action
  - if provider unavailable or key missing, continue offline-only
  - keep payload compact and avoid project-level sensitive identifiers

## Testing Strategy
- `test_ai_pricing.py`:
  - offline suggestion fields populated
  - low-confidence routes to provider
  - budget cap limits API usage
  - accept function overwrites only AI-target fields
  - graceful fallback when provider unavailable
- existing tests remain green (`test_uncertainty.py`, `test_compliance.py`)
