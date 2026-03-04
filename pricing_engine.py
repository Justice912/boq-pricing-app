def calculate_item(row):
    materials = float(row.get("Materials", 0))
    labour = float(row.get("Labour", 0))
    equipment = float(row.get("Equipment", 0))
    subcontractors = float(row.get("Subcontractors", 0))
    qty = float(row.get("Quantity", 0))
    oh_pct = float(row.get("Overheads %", 0))
    mu_pct = float(row.get("Mark-up %", 0))

    direct = materials + labour + equipment + subcontractors
    overheads = direct * oh_pct / 100
    markup = direct * mu_pct / 100
    rate = direct + overheads + markup
    amount = rate * qty

    return {
        "Direct Cost": round(direct, 2),
        "Overheads": round(overheads, 2),
        "Mark-up": round(markup, 2),
        "Rate": round(rate, 2),
        "Amount": round(amount, 2)
    }
