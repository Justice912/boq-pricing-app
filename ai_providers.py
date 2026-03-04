import json
import os
from urllib import error, request


class BaseAIProvider:
    name = "base"

    def available(self):
        return False

    def suggest(self, row, context):
        return None


class OpenAIProvider(BaseAIProvider):
    name = "openai"

    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def available(self):
        return bool(self.api_key)

    def suggest(self, row, context):
        if not self.available():
            return None

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a construction pricing assistant. Return strict JSON only.",
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "task": "propose_rate_components",
                            "row": {
                                "description": row.get("Description", ""),
                                "heading": row.get("Heading1", ""),
                                "unit": row.get("Unit", ""),
                                "quantity": row.get("Quantity", 0),
                            },
                            "offline": context.get("offline", {}),
                            "output_schema": {
                                "AI_Proposed_Materials_Rate_U": "number",
                                "AI_Proposed_Labour_Rate_U": "number",
                                "AI_Proposed_Equipment_Rate_U": "number",
                                "AI_Proposed_Subcontract_Rate_U": "number",
                                "AI_Proposed_Overheads_pct": "number",
                                "AI_Proposed_Markup_pct": "number",
                                "AI_Confidence": "number_0_to_1",
                                "AI_Source": "api",
                                "AI_Rationale": "short_text",
                            },
                        }
                    ),
                },
            ],
        }

        req = request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=20) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            content = body["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            parsed["AI_Source"] = "api"
            return parsed
        except (error.URLError, json.JSONDecodeError, KeyError, IndexError, ValueError):
            return None


def get_provider(name):
    normalized = str(name or "").strip().lower()
    if normalized == "openai":
        provider = OpenAIProvider()
        if provider.available():
            return provider
        return None
    return None


def list_provider_names():
    return ["openai"]
