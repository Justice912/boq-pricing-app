from copy import deepcopy
from difflib import SequenceMatcher


def _norm(text):
    return " ".join(str(text or "").strip().lower().split())


def _score_row_to_rate(row, rate_item):
    desc_score = SequenceMatcher(None, _norm(row.get("Description")), _norm(rate_item.get("Description"))).ratio()
    heading = _norm(row.get("Heading1"))
    sector = _norm(rate_item.get("Sector"))
    heading_score = 1.0 if heading and heading == sector else 0.0
    return 0.8 * desc_score + 0.2 * heading_score


def _proposal_from_rate(rate_item, confidence, source="offline", rationale=""):
    return {
        "AI_Proposed_Materials_Rate_U": float(rate_item.get("Materials_Rate_U", 0) or 0),
        "AI_Proposed_Labour_Rate_U": float(rate_item.get("Labour_Rate_U", 0) or 0),
        "AI_Proposed_Equipment_Rate_U": float(rate_item.get("Equipment_Rate_U", 0) or 0),
        "AI_Proposed_Subcontract_Rate_U": float(rate_item.get("Subcontract_Rate_U", 0) or 0),
        "AI_Proposed_Overheads_pct": float(rate_item.get("Overheads_pct_default", 0.05) or 0.05),
        "AI_Proposed_Markup_pct": float(rate_item.get("Markup_pct_default", 0.10) or 0.10),
        "AI_Confidence": round(float(confidence), 2),
        "AI_Source": source,
        "AI_Rationale": rationale,
    }


def build_offline_suggestion(row, rate_library):
    rate_item_id = row.get("RateItemID")
    if rate_item_id and rate_item_id in rate_library:
        rate = rate_library[rate_item_id]
        return _proposal_from_rate(rate, confidence=0.9, source="offline", rationale="Matched assigned rate item")

    best_id = None
    best_score = 0.0
    for rid, rate in rate_library.items():
        score = _score_row_to_rate(row, rate)
        if score > best_score:
            best_score = score
            best_id = rid

    if best_id is None:
        return {
            "AI_Proposed_Materials_Rate_U": 0.0,
            "AI_Proposed_Labour_Rate_U": 0.0,
            "AI_Proposed_Equipment_Rate_U": 0.0,
            "AI_Proposed_Subcontract_Rate_U": 0.0,
            "AI_Proposed_Overheads_pct": 0.05,
            "AI_Proposed_Markup_pct": 0.10,
            "AI_Confidence": 0.0,
            "AI_Source": "none",
            "AI_Rationale": "No rate-library candidate available",
        }

    rate = rate_library[best_id]
    return _proposal_from_rate(rate, confidence=best_score, source="offline", rationale=f"Best local match: {best_id}")


def generate_suggestions(
    rows,
    rate_library,
    enable_api_fallback=False,
    confidence_threshold=0.65,
    max_api_calls=5,
    provider=None,
):
    out_rows = deepcopy(rows)
    api_calls = 0

    for row in out_rows:
        offline = build_offline_suggestion(row, rate_library)
        final = offline

        should_fallback = (
            enable_api_fallback
            and provider is not None
            and float(offline.get("AI_Confidence", 0)) < float(confidence_threshold)
            and api_calls < int(max_api_calls)
        )

        if should_fallback:
            api_result = provider.suggest(row, {"offline": offline})
            if api_result:
                final = api_result
                api_calls += 1

        row.update(final)

    return out_rows, {"api_calls": api_calls, "rows": len(out_rows)}


def apply_ai_suggestion(row):
    row["Materials_Rate_U"] = float(row.get("AI_Proposed_Materials_Rate_U", row.get("Materials_Rate_U", 0)) or 0)
    row["Labour_Rate_U"] = float(row.get("AI_Proposed_Labour_Rate_U", row.get("Labour_Rate_U", 0)) or 0)
    row["Equipment_Rate_U"] = float(row.get("AI_Proposed_Equipment_Rate_U", row.get("Equipment_Rate_U", 0)) or 0)
    row["Subcontract_Rate_U"] = float(row.get("AI_Proposed_Subcontract_Rate_U", row.get("Subcontract_Rate_U", 0)) or 0)
    row["Overheads_pct"] = float(row.get("AI_Proposed_Overheads_pct", row.get("Overheads_pct", 0.05)) or 0.05)
    row["Markup_pct"] = float(row.get("AI_Proposed_Markup_pct", row.get("Markup_pct", 0.10)) or 0.10)
    return row
