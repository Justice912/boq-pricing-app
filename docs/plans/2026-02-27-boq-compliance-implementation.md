# BOQ Compliance Guardrails Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add trade-aware compliance validation (margin anomalies, unit mismatch, missing build-up) with strictness controls, dashboard metrics, and export reporting.

**Architecture:** Implement rule logic in a pure `compliance.py` module and integrate it into existing row recalculation in `boq_app.py`. Trade policy defaults live in `sectors.py` to keep domain parameters isolated from UI code. Streamlit renders compliance columns, aggregate metrics, and a dedicated export sheet.

**Tech Stack:** Python, Streamlit, pandas, unittest

---

### Task 1: Add failing tests for compliance helpers

**Files:**
- Create: `test_compliance.py`
- Test: `test_compliance.py`

**Step 1: Write the failing test**
Add tests that import `compliance` and assert unit mismatch normalization, margin out-of-band detection, strictness escalation, and missing build-up flagging.

**Step 2: Run test to verify it fails**
Run: `python -m unittest test_compliance.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'compliance'`.

**Step 3: Write minimal implementation**
Create `compliance.py` with helper functions needed by tests.

**Step 4: Run test to verify it passes**
Run: `python -m unittest test_compliance.py -v`
Expected: PASS.

### Task 2: Add trade margin policies and compliance mappings

**Files:**
- Modify: `sectors.py`
- Modify: `compliance.py`
- Test: `test_compliance.py`

**Step 1: Write the failing test**
Add coverage for trade policy fallback behavior.

**Step 2: Run test to verify it fails**
Run: `python -m unittest test_compliance.py -v`
Expected: FAIL for missing/faulty policy lookup.

**Step 3: Write minimal implementation**
Add `TRADE_MARGIN_POLICIES` and policy lookup behavior.

**Step 4: Run test to verify it passes**
Run: `python -m unittest test_compliance.py -v`
Expected: PASS.

### Task 3: Integrate compliance engine into `boq_app.py`

**Files:**
- Modify: `boq_app.py`
- Test: `test_compliance.py`

**Step 1: Write/update failing tests**
Add tests for composed row compliance evaluation behavior in helper-level functions.

**Step 2: Run test to verify it fails**
Run: `python -m unittest test_compliance.py -v`
Expected: FAIL before integration helpers are complete.

**Step 3: Write minimal implementation**
- Add sidebar controls (`Enable compliance checks`, `Strictness`).
- Compute `Compliance_Flags`, `Compliance_Severity`, `Margin_Anomaly_Score` per row.
- Render compliance dashboard and top non-compliant table.

**Step 4: Run test to verify it passes**
Run: `python -m unittest test_compliance.py -v`
Expected: PASS.

### Task 4: Add compliance export and final verification

**Files:**
- Modify: `boq_app.py`
- Verify: `test_compliance.py`, `test_uncertainty.py`

**Step 1: Extend export**
Add `Compliance_Report` worksheet with findings and recommendations.

**Step 2: Run full tests**
Run: `python -m unittest test_compliance.py test_uncertainty.py -v`
Expected: PASS.

**Step 3: Verify app starts**
Run: `python -m streamlit run boq_app.py --server.headless true --server.port 8503`
Expected: Streamlit local URL output.
