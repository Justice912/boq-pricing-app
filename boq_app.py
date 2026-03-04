import streamlit as st
import pandas as pd
from io import BytesIO
from difflib import SequenceMatcher
from datetime import datetime
from rate_library import RATE_LIBRARY
from sectors import TRADE_MARGIN_POLICIES, TRADE_UNCERTAINTY_DEFAULTS
from compliance import evaluate_row_compliance
from ai_pricing import apply_ai_suggestion, generate_suggestions
from ai_providers import get_provider, list_provider_names
from uncertainty import (
    apply_confidence_preset,
    compute_uncertainty_values,
    get_trade_uncertainty_defaults,
    validate_uncertainty_band,
)

# -------------------------------------------------
# PAGE CONFIG
# -------------------------------------------------
st.set_page_config(
    page_title="BoQ Pricing App - Multi-Sector",
    layout="wide"
)

st.markdown(
    """
    <style>
    :root {
        --text-primary: #0A0A0A;
        --text-body: #111111;
        --text-secondary: #1A1A1A;
        --surface: #FFFFFF;
        --surface-alt: #F7F8FA;
        --border: #D9DEE5;
        --muted: #5B6470;
    }

    html, body, [class*="css"] {
        color: var(--text-body) !important;
    }

    .stApp {
        background: var(--surface-alt);
        color: var(--text-body) !important;
    }

    .block-container {
        padding-top: 1.2rem;
        padding-bottom: 1.6rem;
    }

    h1, h2, h3, h4, h5, h6 {
        color: var(--text-primary) !important;
        font-weight: 700 !important;
        letter-spacing: 0.01em;
    }

    p, span, label, div, li, .stMarkdown {
        color: var(--text-body) !important;
    }

    .stCaption, small {
        color: var(--muted) !important;
    }

    .stTextInput label,
    .stSelectbox label,
    .stNumberInput label,
    .stCheckbox label,
    .stSlider label,
    .stRadio label,
    .stMultiSelect label {
        color: var(--text-secondary) !important;
        font-weight: 600 !important;
    }

    [data-testid="stSidebar"] {
        background: #FBFCFE;
        border-right: 1px solid var(--border);
    }

    [data-testid="stSidebar"] * {
        color: var(--text-body) !important;
    }

    [data-testid="stMetricValue"] {
        color: var(--text-primary) !important;
        font-weight: 700 !important;
    }

    [data-testid="stMetricLabel"] {
        color: var(--text-secondary) !important;
    }

    .stButton > button {
        background: #FFFFFF !important;
        color: var(--text-primary) !important;
        border: 1px solid var(--border) !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
    }

    .stButton > button:hover {
        border-color: #B9C1CC !important;
        background: #F8FAFC !important;
    }

    [data-testid="stDataFrame"] {
        border: 1px solid var(--border);
        border-radius: 8px;
        overflow: hidden;
        background: var(--surface);
    }

    [data-testid="stDataFrame"] * {
        color: var(--text-body) !important;
    }

    [data-testid="stFileUploaderDropzone"] {
        background: #FFFFFF;
        border: 1px dashed var(--border);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# -------------------------------------------------
# MATCHING UTILITIES
# -------------------------------------------------
def normalize_text(value: str) -> str:
    return " ".join(str(value).strip().lower().split())

def normalize_unit(value: str) -> str:
    text = normalize_text(value)
    text = text.replace("m^2", "m2").replace("m^3", "m3")
    text = text.replace("m\u00b2", "m2").replace("m\u00b3", "m3")
    return text

def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()

def match_rate_item_tuned(boq_row, rate_library, selected_sector):
    best_match = None
    best_score = 0

    boq_desc = boq_row.get("Description", "")
    boq_unit = normalize_unit(boq_row.get("Unit", ""))
    boq_heading = normalize_text(boq_row.get("Heading1", ""))
    selected_sector_norm = normalize_text(selected_sector)

    for rate_id, rate in rate_library.items():
        # 1) Must be same sector / trade (unless "All Sectors")
        rate_sector_norm = normalize_text(rate.get("Sector", ""))
        if selected_sector_norm != "all sectors" and rate_sector_norm != selected_sector_norm:
            continue

        # 2) Unit match score
        unit_score = 1 if boq_unit and normalize_unit(rate.get("Unit", "")) == boq_unit else 0

        # 3) Heading match score
        heading_score = 1 if boq_heading and rate_sector_norm == boq_heading else 0

        # 4) Description similarity
        desc_score = similarity(boq_desc, rate.get("Description", ""))

        total_score = (
            desc_score * 0.6
            + unit_score * 0.2
            + heading_score * 0.2
        )

        if total_score > best_score:
            best_score = total_score
            best_match = rate_id

    if best_score >= 0.75:
        confidence = "High"
    elif best_score >= 0.55:
        confidence = "Medium"
    elif best_score >= 0.40:
        confidence = "Low"
    else:
        confidence = "Unmatched"

    return best_match, confidence

# -------------------------------------------------
# AUTOFILL HELPER
# -------------------------------------------------
def auto_populate_from_library(row, rate_item):
    row["Materials_Rate_U"] = rate_item.get("Materials_Rate_U", 0)
    row["Labour_Rate_U"] = rate_item.get("Labour_Rate_U", 0)
    row["Equipment_Rate_U"] = rate_item.get("Equipment_Rate_U", 0)
    row["Subcontract_Rate_U"] = rate_item.get("Subcontract_Rate_U", 0)

    row["Overheads_pct"] = rate_item.get("Overheads_pct_default", 0.05)
    row["Markup_pct"] = rate_item.get("Markup_pct_default", 0.10)

    row["RateItemID"] = rate_item.get("RateItemID", "")
    row["IsCustom"] = False
    row["SourceLinks"] = rate_item.get("SourceLinks", [])

    return row


def log_ai_suggestion_event(row_index, row, provider_name):
    log_row = {
        "timestamp": datetime.utcnow().isoformat(),
        "row_index": row_index,
        "provider": provider_name,
        "source": row.get("AI_Source", "none"),
        "confidence": row.get("AI_Confidence", 0),
    }
    with open("ai_pricing.log.jsonl", "a", encoding="utf-8") as fh:
        fh.write(pd.Series(log_row).to_json() + "\n")


def build_boq_row(source_row=None, use_trade_defaults=True, default_confidence="Medium"):
    source_row = source_row or {}
    heading = str(source_row.get("Heading1", ""))
    low, high = apply_confidence_preset(default_confidence)
    if use_trade_defaults:
        low, high = get_trade_uncertainty_defaults(
            heading,
            TRADE_UNCERTAINTY_DEFAULTS,
            fallback=(low, high),
        )

    return {
        "Item No": str(source_row.get("Item No", "")),
        "Heading1": heading,
        "Description": str(source_row.get("Description", "")),
        "Unit": str(source_row.get("Unit", "")),
        "Quantity": float(source_row.get("Quantity", 0) or 0),
        "Materials_Rate_U": float(source_row.get("Materials_Rate_U", 0) or 0),
        "Labour_Rate_U": float(source_row.get("Labour_Rate_U", 0) or 0),
        "Equipment_Rate_U": float(source_row.get("Equipment_Rate_U", 0) or 0),
        "Subcontract_Rate_U": float(source_row.get("Subcontract_Rate_U", 0) or 0),
        "Overheads_pct": float(source_row.get("Overheads_pct", 0.05) or 0.05),
        "Markup_pct": float(source_row.get("Markup_pct", 0.10) or 0.10),
        "RateItemID": str(source_row.get("RateItemID", "")),
        "SuggestedRateItemID": str(source_row.get("SuggestedRateItemID", "")),
        "MatchConfidence": str(source_row.get("MatchConfidence", "")),
        "IsCustom": bool(source_row.get("IsCustom", False)),
        "SourceLinks": source_row.get("SourceLinks", []),
        "Confidence": str(source_row.get("Confidence", default_confidence)),
        "Unc_Low_pct": float(source_row.get("Unc_Low_pct", low) or low),
        "Unc_High_pct": float(source_row.get("Unc_High_pct", high) or high),
        "Rate_Total_U": float(source_row.get("Rate_Total_U", 0) or 0),
        "Amount_Total": float(source_row.get("Amount_Total", 0) or 0),
        "Rate_Min_U": float(source_row.get("Rate_Min_U", 0) or 0),
        "Rate_Base_U": float(source_row.get("Rate_Base_U", 0) or 0),
        "Rate_Max_U": float(source_row.get("Rate_Max_U", 0) or 0),
        "Amount_Min": float(source_row.get("Amount_Min", 0) or 0),
        "Amount_Base": float(source_row.get("Amount_Base", 0) or 0),
        "Amount_Max": float(source_row.get("Amount_Max", 0) or 0),
        "Risk_Spread_Amount": float(source_row.get("Risk_Spread_Amount", 0) or 0),
        "Uncertainty_Warnings": source_row.get("Uncertainty_Warnings", []),
        "Compliance_Flags": source_row.get("Compliance_Flags", []),
        "Compliance_Severity": str(source_row.get("Compliance_Severity", "Info")),
        "Margin_Anomaly_Score": float(source_row.get("Margin_Anomaly_Score", 0) or 0),
        "AI_Proposed_Materials_Rate_U": float(source_row.get("AI_Proposed_Materials_Rate_U", 0) or 0),
        "AI_Proposed_Labour_Rate_U": float(source_row.get("AI_Proposed_Labour_Rate_U", 0) or 0),
        "AI_Proposed_Equipment_Rate_U": float(source_row.get("AI_Proposed_Equipment_Rate_U", 0) or 0),
        "AI_Proposed_Subcontract_Rate_U": float(source_row.get("AI_Proposed_Subcontract_Rate_U", 0) or 0),
        "AI_Proposed_Overheads_pct": float(source_row.get("AI_Proposed_Overheads_pct", 0.05) or 0.05),
        "AI_Proposed_Markup_pct": float(source_row.get("AI_Proposed_Markup_pct", 0.10) or 0.10),
        "AI_Confidence": float(source_row.get("AI_Confidence", 0) or 0),
        "AI_Source": str(source_row.get("AI_Source", "none")),
        "AI_Rationale": str(source_row.get("AI_Rationale", "")),
    }

# -------------------------------------------------
# APP HEADER
# -------------------------------------------------
st.title("BoQ Pricing App - Multi-Sector")

# -------------------------------------------------
# PROJECT DETAILS
# -------------------------------------------------
st.header("📋 Project Details")
project_name = st.text_input("Project Name")
currency = st.selectbox("Currency", ["ZAR", "SZL"])

# -------------------------------------------------
# AVAILABLE SECTORS (FROM RATE LIBRARY)
# -------------------------------------------------
available_sectors = ["All Sectors"] + sorted(
    {v.get("Sector") for v in RATE_LIBRARY.values() if v.get("Sector")}
)

selected_sector = st.selectbox("Sector / Trade", available_sectors)

st.sidebar.header("Risk Controls")
use_trade_defaults = st.sidebar.checkbox("Use trade default uncertainty", value=True)
default_confidence = st.sidebar.selectbox(
    "Default confidence for new items",
    ["High", "Medium", "Low"],
    index=1,
)
wide_band_threshold = st.sidebar.slider(
    "Wide uncertainty band threshold",
    min_value=0.20,
    max_value=1.00,
    value=0.60,
    step=0.05,
)
risk_driver_threshold = st.sidebar.number_input(
    "Risk spread alert threshold",
    min_value=0.0,
    value=10000.0,
    step=1000.0,
)

st.sidebar.header("Compliance Controls")
enable_compliance_checks = st.sidebar.checkbox("Enable compliance checks", value=True)
compliance_strictness = st.sidebar.selectbox(
    "Compliance strictness",
    ["Advisory", "Standard", "Strict"],
    index=1,
)

st.sidebar.header("AI Pricing Controls")
enable_api_fallback = st.sidebar.checkbox("Enable API fallback", value=False)
provider_names = list_provider_names()
provider_name = st.sidebar.selectbox(
    "Provider",
    provider_names if provider_names else ["openai"],
    index=0,
)
ai_confidence_threshold = st.sidebar.slider(
    "Low-confidence threshold",
    min_value=0.40,
    max_value=0.95,
    value=0.70,
    step=0.05,
)
max_api_suggestions = st.sidebar.number_input(
    "Max API suggestions per run",
    min_value=0,
    value=10,
    step=1,
)

# -------------------------------------------------
# BOQ UPLOAD
# -------------------------------------------------
uploaded_file = st.file_uploader(
    "Upload BOQ (Excel or CSV)",
    type=["xlsx", "csv"]
)

if uploaded_file is not None:
    try:
        if uploaded_file.name.endswith(".csv"):
            df_upload = pd.read_csv(uploaded_file)
        else:
            df_upload = pd.read_excel(uploaded_file)

        df_upload.columns = [c.strip() for c in df_upload.columns]

        boq_rows = []

        for _, r in df_upload.iterrows():
            boq_rows.append(
                build_boq_row(
                    source_row=r.to_dict(),
                    use_trade_defaults=use_trade_defaults,
                    default_confidence=default_confidence,
                )
            )

        st.session_state.boq = boq_rows
        st.success(f"✅ Uploaded {len(boq_rows)} BOQ items")

    except Exception as e:
        st.error(f"❌ BOQ upload failed: {e}")

# -------------------------------------------------
# INITIAL BOQ STATE
# -------------------------------------------------
if "boq" not in st.session_state:
    st.session_state.boq = [
        build_boq_row(
            use_trade_defaults=use_trade_defaults,
            default_confidence=default_confidence,
        )
    ]

# -------------------------------------------------
# BOQ INPUT TABLE
# -------------------------------------------------
st.header("🧮 BOQ Input")

rows = st.data_editor(
    st.session_state.boq,
    num_rows="dynamic",
    use_container_width=True,
    key="boq_editor"
)

if st.button("Apply confidence presets to all rows"):
    for row in rows:
        low, high = apply_confidence_preset(row.get("Confidence"))
        if use_trade_defaults:
            low, high = get_trade_uncertainty_defaults(
                row.get("Heading1", ""),
                TRADE_UNCERTAINTY_DEFAULTS,
                fallback=(low, high),
            )
        row["Unc_Low_pct"] = low
        row["Unc_High_pct"] = high
    st.success("Applied uncertainty defaults to all rows")

st.header("AI-Assisted Pricing")
if st.button("Generate AI Suggestions"):
    provider = get_provider(provider_name) if enable_api_fallback else None
    rows, ai_stats = generate_suggestions(
        rows,
        RATE_LIBRARY,
        enable_api_fallback=enable_api_fallback,
        confidence_threshold=ai_confidence_threshold,
        max_api_calls=max_api_suggestions,
        provider=provider,
    )
    for idx, ai_row in enumerate(rows):
        log_ai_suggestion_event(idx, ai_row, provider_name)
    st.success(
        f"AI suggestions generated for {ai_stats['rows']} rows. "
        f"API calls used: {ai_stats['api_calls']}."
    )

# -------------------------------------------------
# MATCHING (AUTO‑SUGGEST)
# -------------------------------------------------
for i, row in enumerate(rows):
    if not row.get("RateItemID"):
        suggested_id, confidence = match_rate_item_tuned(
            row,
            RATE_LIBRARY,
            selected_sector
        )

        row["SuggestedRateItemID"] = suggested_id or ""
        row["MatchConfidence"] = confidence

        if confidence == "High" and suggested_id:
            rows[i] = auto_populate_from_library(
                row,
                RATE_LIBRARY[suggested_id]
            )

# -------------------------------------------------
# RATE ASSIGNMENT (MANUAL / RESET)
# -------------------------------------------------
st.header("🔧 Rate Assignment")

row_index = st.selectbox(
    "Select BOQ Line",
    range(len(rows)),
    format_func=lambda i: f"{rows[i].get('Item No','')} {rows[i].get('Description','')}"
)

rate_items_for_sector = [
    k for k, v in RATE_LIBRARY.items()
    if selected_sector == "All Sectors" or v.get("Sector") == selected_sector
]

rate_item_id = st.selectbox(
    "Rate Item",
    [""] + rate_items_for_sector,
    format_func=lambda x: (
        "Select rate item"
        if x == ""
        else f"{x} — {RATE_LIBRARY[x]['Description']}"
    ),
    key=f"rate_item_{row_index}"
)

if rate_item_id:
    rows[row_index] = auto_populate_from_library(
        rows[row_index],
        RATE_LIBRARY[rate_item_id]
    )

if st.button("Accept AI Suggestion for Selected Row"):
    rows[row_index] = apply_ai_suggestion(rows[row_index])
    st.success("Applied AI suggestion to selected row.")

if st.button("Accept AI Suggestions for All Rows"):
    rows = [apply_ai_suggestion(r) for r in rows]
    st.success("Applied AI suggestions to all rows.")

# -------------------------------------------------
# PRICING CALCULATION
# -------------------------------------------------
for r in rows:
    base = (
        r["Materials_Rate_U"]
        + r["Labour_Rate_U"]
        + r["Equipment_Rate_U"]
        + r["Subcontract_Rate_U"]
    )

    overheads = base * r["Overheads_pct"]
    markup = (base + overheads) * r["Markup_pct"]

    r["Rate_Total_U"] = round(base + overheads + markup, 2)
    r["Amount_Total"] = round(r["Rate_Total_U"] * r["Quantity"], 2)
    uncertainty = compute_uncertainty_values(
        r["Rate_Total_U"],
        r.get("Quantity", 0),
        r.get("Unc_Low_pct", -0.10),
        r.get("Unc_High_pct", 0.15),
    )
    r.update(uncertainty)
    r["Uncertainty_Warnings"] = list(
        validate_uncertainty_band(
            r.get("Unc_Low_pct", -0.10),
            r.get("Unc_High_pct", 0.15),
            max_spread=wide_band_threshold,
        )
    )
    matched_rate = RATE_LIBRARY.get(r.get("RateItemID", ""), {})
    matched_rate_unit = matched_rate.get("Unit", "")
    if enable_compliance_checks:
        compliance_result = evaluate_row_compliance(
            r,
            matched_rate_unit=matched_rate_unit,
            strictness=compliance_strictness,
            trade_policies=TRADE_MARGIN_POLICIES,
        )
    else:
        compliance_result = {
            "Compliance_Flags": [],
            "Compliance_Severity": "Info",
            "Margin_Anomaly_Score": 0.0,
        }
    r.update(compliance_result)

st.session_state.boq = rows

# -------------------------------------------------
# GROUPED DISPLAY
# -------------------------------------------------
st.header("📊 Priced BOQ (Grouped by Trade)")

df = pd.DataFrame(rows)
df["Heading1"] = df["Heading1"].replace("", "Unassigned")
if "Compliance_Flags" not in df.columns:
    df["Compliance_Flags"] = [[] for _ in range(len(df))]
if "Compliance_Severity" not in df.columns:
    df["Compliance_Severity"] = "Info"
if "Margin_Anomaly_Score" not in df.columns:
    df["Margin_Anomaly_Score"] = 0.0
df["Compliance_Flags_Text"] = df["Compliance_Flags"].apply(
    lambda flags: ", ".join(flags) if isinstance(flags, list) else ""
)

grand_total = 0

for heading, group in df.groupby("Heading1"):
    st.subheader(heading.upper())

    st.dataframe(
        group[
            [
                "Item No",
                "Description",
                "Unit",
                "Quantity",
                "Unc_Low_pct",
                "Unc_High_pct",
                "Rate_Min_U",
                "Rate_Base_U",
                "Rate_Max_U",
                "Amount_Min",
                "Amount_Base",
                "Amount_Max",
                "Compliance_Severity",
                "Compliance_Flags_Text",
                "AI_Confidence",
                "AI_Source",
            ]
        ],
        use_container_width=True
    )

    subtotal = group["Amount_Total"].sum()
    grand_total += subtotal

    st.markdown(f"**Subtotal – {heading}: {currency} {subtotal:,.2f}**")
    st.divider()

st.markdown(f"## ✅ GRAND TOTAL: {currency} {grand_total:,.2f}")

total_min = df["Amount_Min"].sum()
total_base = df["Amount_Base"].sum()
total_max = df["Amount_Max"].sum()
risk_spread_total = total_max - total_min

st.subheader("Tender Risk Range")
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Min", f"{currency} {total_min:,.2f}")
col2.metric("Total Base", f"{currency} {total_base:,.2f}")
col3.metric("Total Max", f"{currency} {total_max:,.2f}")
col4.metric("Risk Spread", f"{currency} {risk_spread_total:,.2f}")

invalid_rows = df[df["Uncertainty_Warnings"].apply(lambda x: len(x) > 0)]
if not invalid_rows.empty:
    st.warning(
        f"{len(invalid_rows)} rows have uncertainty guardrail warnings. "
        "Review Unc_Low_pct / Unc_High_pct values."
    )

risk_drivers = df[df["Risk_Spread_Amount"] >= risk_driver_threshold].copy()
if not risk_drivers.empty:
    risk_drivers = risk_drivers.sort_values("Risk_Spread_Amount", ascending=False)
    st.subheader("Top Risk Drivers")
    st.dataframe(
        risk_drivers[
            [
                "Item No",
                "Heading1",
                "Description",
                "Amount_Min",
                "Amount_Base",
                "Amount_Max",
                "Risk_Spread_Amount",
            ]
        ],
        use_container_width=True,
    )

if enable_compliance_checks:
    st.subheader("Compliance Dashboard")
    flagged_rows = df[df["Compliance_Flags"].apply(lambda x: len(x) > 0)]
    critical_rows = df[df["Compliance_Severity"] == "Critical"]
    all_flags = {}
    for flags in df["Compliance_Flags"]:
        for flag in flags:
            all_flags[flag] = all_flags.get(flag, 0) + 1

    c1, c2, c3 = st.columns(3)
    c1.metric("Flagged Rows", int(len(flagged_rows)))
    c2.metric("Critical Rows", int(len(critical_rows)))
    c3.metric("Flag Types", int(len(all_flags)))

    if all_flags:
        st.dataframe(
            pd.DataFrame(
                [{"Flag": name, "Count": count} for name, count in sorted(all_flags.items())]
            ),
            use_container_width=True,
        )

    if not flagged_rows.empty:
        severity_rank = {"Critical": 2, "Warning": 1, "Info": 0}
        non_compliant = flagged_rows.copy()
        non_compliant["SeverityRank"] = non_compliant["Compliance_Severity"].map(severity_rank).fillna(0)
        non_compliant = non_compliant.sort_values(
            ["SeverityRank", "Amount_Base", "Margin_Anomaly_Score"],
            ascending=[False, False, False],
        )
        st.subheader("Top Non-Compliant Rows")
        st.dataframe(
            non_compliant[
                [
                    "Item No",
                    "Heading1",
                    "Description",
                    "Compliance_Severity",
                    "Compliance_Flags_Text",
                    "Amount_Base",
                ]
            ],
            use_container_width=True,
        )

# -------------------------------------------------
# MATCH STATUS & SOURCES
# -------------------------------------------------
current = rows[row_index]

if current.get("MatchConfidence"):
    st.info(
        f"🔍 Match confidence: **{current['MatchConfidence']}** "
        f"(Suggested: {current.get('SuggestedRateItemID', 'None')})"
    )

if current.get("IsCustom"):
    st.warning("⚠️ Custom rates applied")
elif current.get("RateItemID"):
    st.success("✅ Using rate library values")

if current.get("SourceLinks"):
    st.markdown("### 🔗 Rate Source Links")
    for link in current["SourceLinks"]:
        st.markdown(f"- {link}")

if current.get("AI_Source", "none") != "none":
    st.info(
        f"AI Source: **{current.get('AI_Source')}** | "
        f"Confidence: **{current.get('AI_Confidence', 0):.2f}**"
    )
if current.get("AI_Rationale"):
    st.caption(f"AI rationale: {current.get('AI_Rationale')}")

# -------------------------------------------------
# EXPORT
# -------------------------------------------------
st.header("📤 Export")

def export_to_excel(rows, currency):
    df = pd.DataFrame(rows)
    output = BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:

        # BOQ
        boq_rows = []
        works_total = 0

        for heading, group in df.groupby("Heading1"):
            subtotal = group["Amount_Total"].sum()
            works_total += subtotal

            for _, r in group.iterrows():
                boq_rows.append({
                    "Trade": heading,
                    "Item No": r["Item No"],
                    "Description": r["Description"],
                    "Unit": r["Unit"],
                    "Quantity": r["Quantity"],
                    "Rate": r["Rate_Total_U"],
                    "Amount": r["Amount_Total"],
                    "Rate_Min": r.get("Rate_Min_U", 0),
                    "Rate_Base": r.get("Rate_Base_U", 0),
                    "Rate_Max": r.get("Rate_Max_U", 0),
                    "Amount_Min": r.get("Amount_Min", 0),
                    "Amount_Base": r.get("Amount_Base", 0),
                    "Amount_Max": r.get("Amount_Max", 0),
                })

            boq_rows.append({
                "Trade": "",
                "Item No": "",
                "Description": f"Subtotal – {heading}",
                "Unit": "",
                "Quantity": "",
                "Rate": "",
                "Amount": subtotal
            })

        pd.DataFrame(boq_rows).to_excel(writer, sheet_name="BOQ_Priced", index=False)

        # RATE BUILD‑UP
        buildup = []

        for _, r in df.iterrows():
            base_rate = (
                r["Materials_Rate_U"]
                + r["Labour_Rate_U"]
                + r["Equipment_Rate_U"]
                + r["Subcontract_Rate_U"]
            )

            oh_amt = base_rate * r["Overheads_pct"]
            mu_amt = (base_rate + oh_amt) * r["Markup_pct"]

            buildup.append({
                "Trade": r["Heading1"],
                "Item No": r["Item No"],
                "Description": r["Description"],
                "Unit": r["Unit"],
                "Quantity": r["Quantity"],
                "Materials": r["Materials_Rate_U"],
                "Labour": r["Labour_Rate_U"],
                "Equipment": r["Equipment_Rate_U"],
                "Subcontract": r["Subcontract_Rate_U"],
                "Overheads %": r["Overheads_pct"],
                "Overheads Amount": oh_amt,
                "Markup %": r["Markup_pct"],
                "Markup Amount": mu_amt,
                "Final Rate": r["Rate_Total_U"],
                "Amount": r["Amount_Total"],
                "Unc Low %": r.get("Unc_Low_pct", 0),
                "Unc High %": r.get("Unc_High_pct", 0),
                "Amount Min": r.get("Amount_Min", 0),
                "Amount Base": r.get("Amount_Base", 0),
                "Amount Max": r.get("Amount_Max", 0),
                "AI Source": r.get("AI_Source", "none"),
                "AI Confidence": r.get("AI_Confidence", 0),
            })

        pd.DataFrame(buildup).to_excel(writer, sheet_name="Rate_Build_Up", index=False)

        vat = works_total * 0.15
        tender_total = works_total + vat

        pd.DataFrame([
            {"Description": "Subtotal (Works)", "Amount": works_total},
            {"Description": "VAT @ 15%", "Amount": vat},
            {"Description": "Tender Total", "Amount": tender_total},
            {"Description": "Scenario Min Total", "Amount": df["Amount_Min"].sum()},
            {"Description": "Scenario Base Total", "Amount": df["Amount_Base"].sum()},
            {"Description": "Scenario Max Total", "Amount": df["Amount_Max"].sum()},
        ]).to_excel(writer, sheet_name="Tender_Summary", index=False)

        compliance_report = []
        for _, r in df.iterrows():
            compliance_report.append({
                "Trade": r.get("Heading1", ""),
                "Item No": r.get("Item No", ""),
                "Description": r.get("Description", ""),
                "Unit": r.get("Unit", ""),
                "Compliance Severity": r.get("Compliance_Severity", "Info"),
                "Compliance Flags": ", ".join(r.get("Compliance_Flags", [])),
                "Margin Anomaly Score": r.get("Margin_Anomaly_Score", 0),
                "Amount Base": r.get("Amount_Base", 0),
                "AI Source": r.get("AI_Source", "none"),
                "AI Confidence": r.get("AI_Confidence", 0),
                "AI Rationale": r.get("AI_Rationale", ""),
            })
        pd.DataFrame(compliance_report).to_excel(
            writer,
            sheet_name="Compliance_Report",
            index=False,
        )

    output.seek(0)
    return output

if st.button("⬇️ Export to Excel"):
    excel = export_to_excel(rows, currency)
    st.download_button(
        "Download BOQ Excel",
        excel,
        "Priced_BOQ.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
