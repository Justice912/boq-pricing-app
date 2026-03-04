# BOQ Uncertainty Ranges Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add trade-aware per-item uncertainty ranges with min/base/max pricing outputs and risk guardrails in the multi-sector BOQ app.

**Architecture:** Add pure helper functions for uncertainty math and validation in `boq_app.py`, then wire them into row initialization, upload flow, data-editor recalculation, and tender summary. Keep defaults in `sectors.py` so domain tuning is isolated from UI logic.

**Tech Stack:** Python, Streamlit, pandas, pytest

---

### Task 1: Add failing tests for uncertainty math and validation

**Files:**
- Create: `test_uncertainty.py`
- Test: `test_uncertainty.py`

**Step 1: Write the failing test**

```python
def test_compute_uncertainty_values_basic():
    from boq_app import compute_uncertainty_values
    out = compute_uncertainty_values(100.0, 2.0, -0.1, 0.2)
    assert out["Rate_Min_U"] == 90.0
```

**Step 2: Run test to verify it fails**
Run: `pytest test_uncertainty.py -v`
Expected: FAIL because helper functions are not defined.

**Step 3: Write minimal implementation**
Create helper function stubs in `boq_app.py`.

**Step 4: Run test to verify it passes**
Run: `pytest test_uncertainty.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add test_uncertainty.py boq_app.py
git commit -m "test: add uncertainty math coverage"
```

### Task 2: Add trade default uncertainty map and confidence presets

**Files:**
- Modify: `sectors.py`
- Modify: `boq_app.py`
- Test: `test_uncertainty.py`

**Step 1: Write the failing test**
Add tests for default map lookups and confidence preset behavior.

**Step 2: Run test to verify it fails**
Run: `pytest test_uncertainty.py -v`
Expected: FAIL due to missing mappings/preset logic.

**Step 3: Write minimal implementation**
- Add `TRADE_UNCERTAINTY_DEFAULTS` and `CONFIDENCE_PRESETS`.
- Add helpers: default lookup + confidence application.

**Step 4: Run test to verify it passes**
Run: `pytest test_uncertainty.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add sectors.py boq_app.py test_uncertainty.py
git commit -m "feat: add trade defaults and confidence presets"
```

### Task 3: Integrate uncertainty fields into BOQ rows and calculations

**Files:**
- Modify: `boq_app.py`
- Test: `test_uncertainty.py`

**Step 1: Write the failing test**
Add test for row recalculation returning min/base/max fields.

**Step 2: Run test to verify it fails**
Run: `pytest test_uncertainty.py -v`
Expected: FAIL due to missing integration in row calculation.

**Step 3: Write minimal implementation**
- Extend row schema defaults/upload initialization.
- Recalc row fields with scenario outputs.

**Step 4: Run test to verify it passes**
Run: `pytest test_uncertainty.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add boq_app.py test_uncertainty.py
git commit -m "feat: integrate uncertainty calculations into boq rows"
```

### Task 4: Add summary metrics, warnings, and risk driver table

**Files:**
- Modify: `boq_app.py`
- Test: `test_uncertainty.py`

**Step 1: Write the failing test**
Add tests for invalid band warnings and top-risk driver selection helper.

**Step 2: Run test to verify it fails**
Run: `pytest test_uncertainty.py -v`
Expected: FAIL due to missing validation helpers.

**Step 3: Write minimal implementation**
- Add guardrail helper for invalid/wide ranges.
- Add summary metrics and filtered high-risk rows table.

**Step 4: Run test to verify it passes**
Run: `pytest test_uncertainty.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add boq_app.py test_uncertainty.py
git commit -m "feat: add uncertainty summary guardrails and risk drivers"
```

### Task 5: Final verification

**Files:**
- Verify: `boq_app.py`, `sectors.py`, `test_uncertainty.py`

**Step 1: Run full test suite**
Run: `pytest -v`
Expected: PASS for all tests.

**Step 2: Run app manually**
Run: `python -m streamlit run boq_app.py --server.headless true --server.port 8502`
Expected: app starts and exposes local URL.

**Step 3: Commit docs updates if needed**
```bash
git add docs/plans/2026-02-27-boq-uncertainty-design.md docs/plans/2026-02-27-boq-uncertainty-implementation.md
git commit -m "docs: add boq uncertainty design and implementation plan"
```
