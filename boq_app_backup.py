import streamlit as st
import pandas as pd
from io import BytesIO
from rate_library import RATE_LIBRARY

# -------------------------------------------------
# PAGE CONFIG
# -------------------------------------------------
st.set_page_config(
    page_title="BoQ Pricing App – Multi‑Sector",
    layout="wide"
)

# -------------------------------------------------
# HELPER: AUTOFILL FROM RATE LIBRARY
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

# -------------------------------------------------
# HEADER
# -------------------------------------------------
st.title("BoQ Pricing App – Multi‑Sector")

# -------------------------------------------------
# PROJECT DETAILS
# -------------------------------------------------
st.header("📋 Project Details")
project_name = st.text_input("Project Name")
currency = st.selectbox("Currency", ["ZAR", "SZL"])

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
            boq_rows.append({
                "Item No": str(r.get("Item No", "")),
                "Heading1": str(r.get("Heading1", "")),   # ✅ sector / trade
                "Description": str(r.get("Description", "")),
                "Unit": str(r.get("Unit", "")),
                "Quantity": float(r.get("Quantity", 0) or 0),

                "Materials_Rate_U": 0.0,
                "Labour_Rate_U": 0.0,
                "Equipment_Rate_U": 0.0,
                "Subcontract_Rate_U": 0.0,

                "Overheads_pct": 0.05,
                "Markup_pct": 0.10,

                "RateItemID": "",
                "IsCustom": False,
                "SourceLinks": [],

                "Rate_Total_U": 0.0,
                "Amount_Total": 0.0,
            })

        if boq_rows:
            st.session_state.boq = boq_rows
            st.success(f"✅ Uploaded {len(boq_rows)} BOQ items")

    except Exception as e:
        st.error(f"❌ BOQ upload failed: {e}")

# -------------------------------------------------
# INITIAL BOQ STATE
# -------------------------------------------------
if "boq" not in st.session_state:
    st.session_state.boq = [{
        "Item No": "",
        "Heading1": "",
        "Description": "",
        "Unit": "",
        "Quantity": 0.0,

        "Materials_Rate_U": 0.0,
        "Labour_Rate_U": 0.0,
        "Equipment_Rate_U": 0.0,
        "Subcontract_Rate_U": 0.0,

        "Overheads_pct": 0.05,
        "Markup_pct": 0.10,

        "RateItemID": "",
        "IsCustom": False,
        "SourceLinks": [],

        "Rate_Total_U": 0.0,
        "Amount_Total": 0.0,
    }]

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

# -------------------------------------------------
# RATE AUTOFILL (MULTI‑SECTOR)
# -------------------------------------------------
st.header("🔧 Rate Assignment")

row_index = st.selectbox(
    "Select BOQ Line",
    range(len(rows)),
    format_func=lambda i: f"{rows[i].get('Item No','')} {rows[i].get('Description','')}"
)

selected_heading = rows[row_index].get("Heading1", "").strip()

rate_items_for_heading = [
    k for k, v in RATE_LIBRARY.items()
    if v.get("Heading1", "").strip().lower() == selected_heading.lower()
]

rate_item_id = st.selectbox(
    "Rate Item (Auto‑Populate)",
    [""] + rate_items_for_heading,
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

st.session_state.boq = rows

# -------------------------------------------------
# GROUPED BOQ DISPLAY
# -------------------------------------------------
st.header("📊 Priced BOQ (Grouped by Trade)")

df = pd.DataFrame(rows)
df["Heading1"] = df["Heading1"].replace("", "Unassigned")

grand_total = 0

for heading, group in df.groupby("Heading1"):
    st.subheader(heading.upper())

    st.dataframe(
        group[
            ["Item No", "Description", "Unit", "Quantity", "Rate_Total_U", "Amount_Total"]
        ],
        use_container_width=True
    )

    subtotal = group["Amount_Total"].sum()
    grand_total += subtotal

    st.markdown(f"**Subtotal – {heading}: {currency} {subtotal:,.2f}**")
    st.divider()

st.markdown(f"## ✅ GRAND TOTAL: {currency} {grand_total:,.2f}")

# -------------------------------------------------
# EXPORT TO EXCEL (MULTI‑SECTOR)
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
                    "Amount": r["Amount_Total"]
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
                "Amount": r["Amount_Total"]
            })

        pd.DataFrame(buildup).to_excel(writer, sheet_name="Rate_Build_Up", index=False)

        vat = works_total * 0.15
        tender_total = works_total + vat

        pd.DataFrame([
            {"Description": "Subtotal (Works)", "Amount": works_total},
            {"Description": "VAT @ 15%", "Amount": vat},
            {"Description": "Tender Total", "Amount": tender_total}
        ]).to_excel(writer, sheet_name="Tender_Summary", index=False)

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