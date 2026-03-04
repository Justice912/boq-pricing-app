import streamlit as st
from pricing_engine import calculate_item
from database import init_db, save_project, load_projects, load_project
from excel_utils import import_boq, export_boq

init_db()

st.set_page_config(
    page_title="BoQ Pricing App – Single User",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("BoQ Pricing App – Single User")

# =============================
# SIDEBAR: UPLOAD BOQ
# =============================
st.sidebar.header("📤 Upload BoQ")

uploaded_file = st.sidebar.file_uploader(
    "Upload Excel (.xlsx) or CSV",
    type=["xlsx", "csv"]
)

# =============================
# PROJECT DETAILS
# =============================
st.header("📋 Project Details")

project_name = st.text_input("Project Name")
currency = st.selectbox("Currency", ["ZAR", "SZL"])

# =============================
# SESSION STATE
# =============================
if "boq_data" not in st.session_state:
    st.session_state.boq_data = [{
        "Item No": "",
        "Description": "",
        "Unit": "",
        "Quantity": 0.0,
        "Materials": 0.0,
        "Labour": 0.0,
        "Equipment": 0.0,
        "Subcontractors": 0.0,
        "Overheads %": 10.0,
        "Mark-up %": 15.0
    }]

if uploaded_file:
    st.session_state.boq_data = import_boq(uploaded_file)

# =============================
# BOQ TABLE
# =============================
st.header("🧮 BoQ Pricing")

rows = st.data_editor(
    st.session_state.boq_data,
    num_rows="dynamic",
    use_container_width=True
)

results = []
for r in rows:
    calc = calculate_item(r)
    r.update(calc)
    results.append(r)

st.session_state.boq_data = results

st.header("📊 Priced BoQ")
st.dataframe(results, use_container_width=True)

# =============================
# SAVE / LOAD
# =============================
st.header("💾 Project Management")

if st.button("Save Project"):
    if project_name:
        save_project(project_name, currency, results)
        st.success("Project saved successfully")
    else:
        st.warning("Please enter a project name")

projects = load_projects()
project_map = {f"{p[1]} ({p[2][:10]})": p[0] for p in projects}

selected = st.selectbox("Load Project", [""] + list(project_map.keys()))
if selected:
    name, curr, data = load_project(project_map[selected])
    st.session_state.boq_data = data
    st.success(f"Loaded project: {name}")

# =============================
# EXPORT
# =============================
st.header("⬇️ Export")

if st.button("Export to Excel"):
    file = export_boq(results, currency)
    with open(file, "rb") as f:
        st.download_button(
            "Download Excel",
            f,
            file_name=file,
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
# =============================
# TENDER SUMMARY
# =============================
st.header("📑 Tender Summary")

total_direct = sum(item.get("Direct Cost", 0) for item in results)
total_overheads = sum(item.get("Overheads", 0) for item in results)
total_markup = sum(item.get("Mark-up", 0) for item in results)

works_subtotal = total_direct + total_overheads + total_markup

vat_rate = st.number_input("VAT %", value=15.0)
vat_amount = works_subtotal * vat_rate / 100

tender_total = works_subtotal + vat_amount

col1, col2 = st.columns(2)

with col1:
    st.metric("Direct Cost Total", f"{currency} {total_direct:,.2f}")
    st.metric("Overheads Total", f"{currency} {total_overheads:,.2f}")
    st.metric("Mark‑up Total", f"{currency} {total_markup:,.2f}")

with col2:
    st.metric("Works Subtotal", f"{currency} {works_subtotal:,.2f}")
    st.metric("VAT Amount", f"{currency} {vat_amount:,.2f}")
    st.metric("✅ Tender Total", f"{currency} {tender_total:,.2f}")