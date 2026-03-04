from typing import Dict, Iterable, Tuple

FALLBACK_UNCERTAINTY = (-0.10, 0.15)
CONFIDENCE_PRESETS = {
    "High": (-0.05, 0.08),
    "Medium": (-0.10, 0.15),
    "Low": (-0.20, 0.30),
}


def _to_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _normalize_text(value: str) -> str:
    return " ".join(str(value or "").strip().lower().split())


def get_trade_uncertainty_defaults(
    heading: str,
    defaults: Dict[str, Dict[str, float]],
    fallback: Tuple[float, float] = FALLBACK_UNCERTAINTY,
) -> Tuple[float, float]:
    normalized_heading = _normalize_text(heading)
    value = defaults.get(normalized_heading)
    if not value:
        return fallback

    low = _to_float(value.get("low"), fallback[0])
    high = _to_float(value.get("high"), fallback[1])
    return low, high


def apply_confidence_preset(
    confidence: str,
    presets: Dict[str, Tuple[float, float]] = CONFIDENCE_PRESETS,
    fallback: Tuple[float, float] = FALLBACK_UNCERTAINTY,
) -> Tuple[float, float]:
    return presets.get(str(confidence or "").strip(), fallback)


def validate_uncertainty_band(
    unc_low_pct: float,
    unc_high_pct: float,
    max_spread: float = 0.60,
) -> Iterable[str]:
    warnings = []
    low = _to_float(unc_low_pct)
    high = _to_float(unc_high_pct)

    if low > 0:
        warnings.append("invalid_low_positive")
    if high < 0:
        warnings.append("invalid_high_negative")
    if abs(high - low) > max_spread:
        warnings.append("band_too_wide")

    return warnings


def compute_uncertainty_values(
    rate_base_u: float,
    quantity: float,
    unc_low_pct: float,
    unc_high_pct: float,
):
    rate = max(0.0, _to_float(rate_base_u))
    qty = max(0.0, _to_float(quantity))
    low = _to_float(unc_low_pct, FALLBACK_UNCERTAINTY[0])
    high = _to_float(unc_high_pct, FALLBACK_UNCERTAINTY[1])

    rate_min = max(0.0, round(rate * (1 + low), 2))
    rate_base = round(rate, 2)
    rate_max = max(0.0, round(rate * (1 + high), 2))

    amount_min = round(rate_min * qty, 2)
    amount_base = round(rate_base * qty, 2)
    amount_max = round(rate_max * qty, 2)

    return {
        "Rate_Min_U": rate_min,
        "Rate_Base_U": rate_base,
        "Rate_Max_U": rate_max,
        "Amount_Min": amount_min,
        "Amount_Base": amount_base,
        "Amount_Max": amount_max,
        "Risk_Spread_Amount": round(amount_max - amount_min, 2),
    }
