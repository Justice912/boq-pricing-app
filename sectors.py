SECTORS = {
    "Construction": [
        "Materials", "Labour", "Equipment", "Subcontractors"
    ],
    "Civil Works": [
        "Materials", "Labour", "Plant", "Subcontractors"
    ],
    "Mechanical Engineering": [
        "Materials", "Fabrication Labour", "Installation Labour", "Equipment", "Subcontractors"
    ],
    "Electrical Engineering": [
        "Materials", "Installation Labour", "Testing & Commissioning", "Subcontractors"
    ],
    "Plumbing": [
        "Materials", "Labour", "Testing", "Subcontractors"
    ],
    "HVAC": [
        "Equipment", "Ducting", "Installation Labour", "Controls", "Commissioning"
    ],
    "Painting": [
        "Materials", "Labour", "Access Equipment"
    ],
    "Cleaning": [
        "Labour", "Chemicals", "Equipment", "Supervision"
    ]
}

# Default uncertainty ranges by trade heading (normalized lower-case keys).
TRADE_UNCERTAINTY_DEFAULTS = {
    "civil works": {"low": -0.12, "high": 0.20},
    "construction": {"low": -0.10, "high": 0.18},
    "mechanical engineering": {"low": -0.10, "high": 0.16},
    "electrical engineering": {"low": -0.08, "high": 0.14},
    "plumbing": {"low": -0.10, "high": 0.16},
    "hvac": {"low": -0.12, "high": 0.18},
    "painting": {"low": -0.10, "high": 0.15},
    "cleaning": {"low": -0.08, "high": 0.12},
}

TRADE_MARGIN_POLICIES = {
    "construction": {"oh_min": 0.05, "oh_max": 0.18, "mu_min": 0.08, "mu_max": 0.22},
    "civil works": {"oh_min": 0.05, "oh_max": 0.20, "mu_min": 0.08, "mu_max": 0.25},
    "mechanical engineering": {"oh_min": 0.05, "oh_max": 0.16, "mu_min": 0.08, "mu_max": 0.20},
    "electrical engineering": {"oh_min": 0.05, "oh_max": 0.15, "mu_min": 0.08, "mu_max": 0.18},
    "plumbing": {"oh_min": 0.05, "oh_max": 0.16, "mu_min": 0.08, "mu_max": 0.20},
    "hvac": {"oh_min": 0.06, "oh_max": 0.18, "mu_min": 0.10, "mu_max": 0.22},
    "painting": {"oh_min": 0.05, "oh_max": 0.15, "mu_min": 0.08, "mu_max": 0.18},
    "cleaning": {"oh_min": 0.04, "oh_max": 0.12, "mu_min": 0.08, "mu_max": 0.15},
}
