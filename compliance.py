from typing import Dict, List, Optional

DEFAULT_MARGIN_POLICY = {"oh_min": 0.05, "oh_max": 0.18, "mu_min": 0.08, "mu_max": 0.22}


def normalize_text(value: str) -> str:
    return " ".join(str(value or "").strip().lower().split())


def normalize_unit(value: str) -> str:
    text = normalize_text(value)
    text = text.replace("m^2", "m2").replace("m^3", "m3")
    return text


def is_unit_mismatch(boq_unit: str, matched_rate_unit: str) -> bool:
    if not matched_rate_unit:
        return False
    return normalize_unit(boq_unit) != normalize_unit(matched_rate_unit)


def get_trade_policy(heading: str, trade_policies: Dict[str, Dict[str, float]]):
    return trade_policies.get(normalize_text(heading), DEFAULT_MARGIN_POLICY)


def detect_margin_flags(overheads_pct: float, markup_pct: float, policy: Dict[str, float]) -> List[str]:
    flags = []
    if overheads_pct < policy["oh_min"] or overheads_pct > policy["oh_max"]:
        flags.append("overheads_out_of_band")
    if markup_pct < policy["mu_min"] or markup_pct > policy["mu_max"]:
        flags.append("markup_out_of_band")
    return flags


def detect_missing_cost_build_up(row: Dict) -> bool:
    amount_total = float(row.get("Amount_Total", 0) or 0)
    if amount_total <= 0:
        return False

    components = [
        float(row.get("Materials_Rate_U", 0) or 0),
        float(row.get("Labour_Rate_U", 0) or 0),
        float(row.get("Equipment_Rate_U", 0) or 0),
        float(row.get("Subcontract_Rate_U", 0) or 0),
    ]
    positive_components = sum(1 for c in components if c > 0)
    return positive_components < 2


def determine_severity(flags: List[str], strictness: str) -> str:
    if not flags:
        return "Info"

    strictness = (strictness or "Standard").strip().lower()
    has_margin_pair = (
        "overheads_out_of_band" in flags and "markup_out_of_band" in flags
    )
    has_structural = (
        "unit_mismatch" in flags or "missing_cost_build_up" in flags
    )

    if strictness == "strict":
        if has_structural or has_margin_pair:
            return "Critical"
    if strictness == "advisory":
        return "Warning"

    return "Warning"


def evaluate_row_compliance(
    row: Dict,
    matched_rate_unit: Optional[str],
    strictness: str,
    trade_policies: Dict[str, Dict[str, float]],
):
    policy = get_trade_policy(row.get("Heading1", ""), trade_policies)
    flags = detect_margin_flags(
        float(row.get("Overheads_pct", 0) or 0),
        float(row.get("Markup_pct", 0) or 0),
        policy,
    )

    if is_unit_mismatch(row.get("Unit", ""), matched_rate_unit or ""):
        flags.append("unit_mismatch")

    if detect_missing_cost_build_up(row):
        flags.append("missing_cost_build_up")

    severity = determine_severity(flags, strictness)
    anomaly_score = len(flags)

    return {
        "Compliance_Flags": flags,
        "Compliance_Severity": severity,
        "Margin_Anomaly_Score": anomaly_score,
    }
