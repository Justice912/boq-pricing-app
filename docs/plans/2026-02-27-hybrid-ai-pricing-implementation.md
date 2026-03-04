# Hybrid AI Pricing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement suggest-only hybrid AI-assisted pricing with offline-first proposals and configurable API fallback.

**Architecture:** Create pure orchestration helpers in `ai_pricing.py` and provider abstractions in `ai_providers.py`, then wire controls/actions into `boq_app.py`. Keep proposal data separate from active pricing fields until explicit accept actions are invoked.

**Tech Stack:** Python, Streamlit, pandas, unittest, urllib

---

### Task 1: Add failing tests for hybrid suggestion orchestration

**Files:**
- Create: `test_ai_pricing.py`
- Test: `test_ai_pricing.py`

**Step 1: Write the failing test**
Add tests for offline suggestion creation, provider fallback routing, API budget cap, and suggest-only behavior.

**Step 2: Run test to verify it fails**
Run: `python -m unittest test_ai_pricing.py -v`
Expected: FAIL with missing `ai_pricing` module.

**Step 3: Write minimal implementation**
Create `ai_pricing.py` with helper functions used by tests.

**Step 4: Run test to verify it passes**
Run: `python -m unittest test_ai_pricing.py -v`
Expected: PASS.

### Task 2: Add provider interface and configurable OpenAI adapter

**Files:**
- Create: `ai_providers.py`
- Modify: `ai_pricing.py`
- Test: `test_ai_pricing.py`

**Step 1: Write/update failing tests**
Add tests for provider registry lookup and graceful provider-unavailable fallback.

**Step 2: Run test to verify it fails**
Run: `python -m unittest test_ai_pricing.py -v`
Expected: FAIL for missing provider behavior.

**Step 3: Write minimal implementation**
Add provider base protocol, registry resolver, and OpenAI adapter that returns `None` when unavailable.

**Step 4: Run test to verify it passes**
Run: `python -m unittest test_ai_pricing.py -v`
Expected: PASS.

### Task 3: Integrate AI controls and suggest/accept workflow in app

**Files:**
- Modify: `boq_app.py`
- Modify: `ai_pricing.py`
- Test: `test_ai_pricing.py`

**Step 1: Extend row schema**
Add AI proposal fields and metadata fields to BOQ row defaults.

**Step 2: Add UI controls/actions**
Add sidebar AI controls and buttons:
- generate suggestions (batch)
- accept suggestion for selected row
- accept all suggestions

**Step 3: Keep suggest-only safety**
Ensure existing active rate fields do not change until accept action runs.

**Step 4: Run tests**
Run: `python -m unittest test_ai_pricing.py -v`
Expected: PASS.

### Task 4: Final verification

**Files:**
- Verify: `test_ai_pricing.py`, `test_uncertainty.py`, `test_compliance.py`
- Verify: `boq_app.py`, `ai_pricing.py`, `ai_providers.py`

**Step 1: Run all unit tests**
Run: `python -m unittest test_ai_pricing.py test_uncertainty.py test_compliance.py -v`
Expected: PASS.

**Step 2: Syntax compile**
Run: `python -m py_compile boq_app.py ai_pricing.py ai_providers.py`
Expected: PASS.

**Step 3: Run app startup verification**
Run: `python -m streamlit run boq_app.py --server.headless true --server.port 8504`
Expected: Streamlit local URL appears.
