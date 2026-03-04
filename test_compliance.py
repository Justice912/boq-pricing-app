import unittest

from compliance import (
    detect_margin_flags,
    detect_missing_cost_build_up,
    evaluate_row_compliance,
    get_trade_policy,
    is_unit_mismatch,
)


class TestCompliance(unittest.TestCase):
    def test_unit_mismatch_normalization(self):
        self.assertFalse(is_unit_mismatch("m^2", "m2"))
        self.assertTrue(is_unit_mismatch("m3", "m2"))

    def test_margin_flags_detect_out_of_band(self):
        policy = {"oh_min": 0.05, "oh_max": 0.15, "mu_min": 0.08, "mu_max": 0.20}
        flags = detect_margin_flags(0.20, 0.30, policy)
        self.assertIn("overheads_out_of_band", flags)
        self.assertIn("markup_out_of_band", flags)

    def test_missing_cost_build_up_detection(self):
        row = {
            "Amount_Total": 1000,
            "Materials_Rate_U": 50,
            "Labour_Rate_U": 0,
            "Equipment_Rate_U": 0,
            "Subcontract_Rate_U": 0,
        }
        self.assertTrue(detect_missing_cost_build_up(row))

    def test_strict_severity_escalates_for_unit_mismatch(self):
        row = {
            "Heading1": "Civil Works",
            "Overheads_pct": 0.10,
            "Markup_pct": 0.12,
            "Unit": "m",
            "Amount_Total": 500,
            "Materials_Rate_U": 10,
            "Labour_Rate_U": 10,
            "Equipment_Rate_U": 10,
            "Subcontract_Rate_U": 10,
        }
        result = evaluate_row_compliance(
            row,
            matched_rate_unit="nr",
            strictness="Strict",
            trade_policies={"civil works": {"oh_min": 0.05, "oh_max": 0.15, "mu_min": 0.08, "mu_max": 0.20}},
        )
        self.assertEqual(result["Compliance_Severity"], "Critical")
        self.assertIn("unit_mismatch", result["Compliance_Flags"])

    def test_trade_policy_fallback_is_available(self):
        policy = get_trade_policy("unknown trade", {})
        self.assertIn("oh_min", policy)
        self.assertIn("mu_max", policy)


if __name__ == "__main__":
    unittest.main()
