import pandas as pd
from pathlib import Path

RATE_LIBRARY_FILE = Path(__file__).parent / "Rate_Library.csv"


def load_rate_library():
    try:
        df = pd.read_csv(RATE_LIBRARY_FILE, encoding="utf-8-sig")
    except UnicodeDecodeError:
        df = pd.read_csv(RATE_LIBRARY_FILE, encoding="latin-1")
    df.columns = [c.strip() for c in df.columns]

    rate_library = {}

    def clean_text(value):
        if pd.isna(value):
            return ""
        return str(value).strip()

    def clean_number(value, default=0.0):
        num = pd.to_numeric(value, errors="coerce")
        if pd.isna(num):
            return float(default)
        return float(num)

    for _, row in df.iterrows():
        rate_item_id = clean_text(row.get("RateItemID"))
        if not rate_item_id:
            continue

        sector = clean_text(row.get("Heading1")) or "Unassigned"

        rate_library[rate_item_id] = {
            "RateItemID": rate_item_id,

            # Use Heading1 as sector / trade
            "Sector": sector,

            "Description": clean_text(row.get("Description")),
            "Unit": clean_text(row.get("Unit")),

            "Materials_Rate_U": clean_number(row.get("Materials_Rate_U")),
            "Labour_Rate_U": clean_number(row.get("Labour_Rate_U")),
            "Equipment_Rate_U": clean_number(row.get("Equipment_Rate_U")),
            "Subcontract_Rate_U": clean_number(row.get("Subcontract_Rate_U")),

            "Overheads_pct_default": clean_number(row.get("Overheads_pct_default"), 0.05),
            "Markup_pct_default": clean_number(row.get("Markup_pct_default"), 0.10),

            "SourceLinks": (
                [clean_text(row.get("SourceLinks"))]
                if clean_text(row.get("SourceLinks")) else []
            ),
        }

    return rate_library


RATE_LIBRARY = load_rate_library()
