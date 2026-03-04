import unittest

from uncertainty import (
    apply_confidence_preset,
    compute_uncertainty_values,
    get_trade_uncertainty_defaults,
    validate_uncertainty_band,
)


class TestUncertainty(unittest.TestCase):
    def test_compute_uncertainty_values_basic(self):
        result = compute_uncertainty_values(100.0, 2.0, -0.10, 0.20)

        self.assertEqual(result["Rate_Min_U"], 90.0)
        self.assertEqual(result["Rate_Base_U"], 100.0)
        self.assertEqual(result["Rate_Max_U"], 120.0)
        self.assertEqual(result["Amount_Min"], 180.0)
        self.assertEqual(result["Amount_Base"], 200.0)
        self.assertEqual(result["Amount_Max"], 240.0)

    def test_compute_uncertainty_clamps_negative_rates_to_zero(self):
        result = compute_uncertainty_values(5.0, 1.0, -2.0, 0.10)
        self.assertEqual(result["Rate_Min_U"], 0.0)

    def test_trade_defaults_lookup_uses_fallback_when_missing(self):
        defaults = {"civil works": {"low": -0.12, "high": 0.18}}
        low, high = get_trade_uncertainty_defaults("Unknown", defaults)
        self.assertEqual((low, high), (-0.10, 0.15))

    def test_confidence_preset_applies_known_level(self):
        low, high = apply_confidence_preset("Low")
        self.assertLess(low, -0.10)
        self.assertGreater(high, 0.20)

    def test_validate_uncertainty_band_flags_invalid_direction_and_wide_band(self):
        warnings = validate_uncertainty_band(0.25, -0.20, max_spread=0.20)
        self.assertIn("invalid_low_positive", warnings)
        self.assertIn("invalid_high_negative", warnings)
        self.assertIn("band_too_wide", warnings)


if __name__ == "__main__":
    unittest.main()
