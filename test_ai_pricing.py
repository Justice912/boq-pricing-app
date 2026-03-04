import unittest

from ai_pricing import apply_ai_suggestion, generate_suggestions
from ai_providers import get_provider


class DummyProvider:
    def __init__(self):
        self.calls = 0

    def suggest(self, row, context):
        self.calls += 1
        return {
            "AI_Proposed_Materials_Rate_U": 11.0,
            "AI_Proposed_Labour_Rate_U": 12.0,
            "AI_Proposed_Equipment_Rate_U": 13.0,
            "AI_Proposed_Subcontract_Rate_U": 14.0,
            "AI_Proposed_Overheads_pct": 0.10,
            "AI_Proposed_Markup_pct": 0.15,
            "AI_Confidence": 0.82,
            "AI_Source": "api",
            "AI_Rationale": "Provider suggestion",
        }


class TestAIPricing(unittest.TestCase):
    def setUp(self):
        self.rate_library = {
            "R1": {
                "Description": "Concrete foundation",
                "Materials_Rate_U": 100,
                "Labour_Rate_U": 50,
                "Equipment_Rate_U": 20,
                "Subcontract_Rate_U": 10,
                "Overheads_pct_default": 0.08,
                "Markup_pct_default": 0.12,
                "Sector": "Civil Works",
            }
        }

    def test_offline_suggestion_populates_proposed_fields(self):
        rows = [{"Description": "Concrete foundation", "Heading1": "Civil Works", "RateItemID": "R1"}]
        out_rows, stats = generate_suggestions(rows, self.rate_library)
        row = out_rows[0]

        self.assertEqual(row["AI_Source"], "offline")
        self.assertGreaterEqual(row["AI_Confidence"], 0.6)
        self.assertEqual(row["AI_Proposed_Materials_Rate_U"], 100)
        self.assertEqual(stats["api_calls"], 0)

    def test_low_confidence_routes_to_provider_with_cap(self):
        rows = [
            {"Description": "Unknown item A", "Heading1": "Civil Works"},
            {"Description": "Unknown item B", "Heading1": "Civil Works"},
        ]
        provider = DummyProvider()
        out_rows, stats = generate_suggestions(
            rows,
            self.rate_library,
            enable_api_fallback=True,
            confidence_threshold=0.7,
            max_api_calls=1,
            provider=provider,
        )

        self.assertEqual(provider.calls, 1)
        self.assertEqual(stats["api_calls"], 1)
        self.assertEqual(out_rows[0]["AI_Source"], "api")
        self.assertEqual(out_rows[1]["AI_Source"], "offline")

    def test_apply_ai_suggestion_is_explicit(self):
        row = {
            "Materials_Rate_U": 1,
            "Labour_Rate_U": 1,
            "Equipment_Rate_U": 1,
            "Subcontract_Rate_U": 1,
            "Overheads_pct": 0.01,
            "Markup_pct": 0.01,
            "AI_Proposed_Materials_Rate_U": 5,
            "AI_Proposed_Labour_Rate_U": 6,
            "AI_Proposed_Equipment_Rate_U": 7,
            "AI_Proposed_Subcontract_Rate_U": 8,
            "AI_Proposed_Overheads_pct": 0.10,
            "AI_Proposed_Markup_pct": 0.15,
        }
        applied = apply_ai_suggestion(row.copy())
        self.assertEqual(applied["Materials_Rate_U"], 5)
        self.assertEqual(applied["Markup_pct"], 0.15)

    def test_generate_suggestions_does_not_overwrite_active_rates(self):
        rows = [
            {
                "Description": "Concrete foundation",
                "Heading1": "Civil Works",
                "RateItemID": "R1",
                "Materials_Rate_U": 1,
            }
        ]
        out_rows, _ = generate_suggestions(rows, self.rate_library)
        self.assertEqual(rows[0]["Materials_Rate_U"], 1)
        self.assertEqual(out_rows[0]["Materials_Rate_U"], 1)
        self.assertEqual(out_rows[0]["AI_Proposed_Materials_Rate_U"], 100)

    def test_unknown_provider_returns_none(self):
        self.assertIsNone(get_provider("not-real-provider"))

    def test_enable_api_without_provider_stays_offline(self):
        rows = [{"Description": "Unknown item A", "Heading1": "Civil Works"}]
        out_rows, stats = generate_suggestions(
            rows,
            self.rate_library,
            enable_api_fallback=True,
            confidence_threshold=0.7,
            max_api_calls=3,
            provider=None,
        )
        self.assertEqual(stats["api_calls"], 0)
        self.assertEqual(out_rows[0]["AI_Source"], "offline")


if __name__ == "__main__":
    unittest.main()
