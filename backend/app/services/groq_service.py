from __future__ import annotations

import json
from typing import Any

from groq import Groq
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.resume import ParsedResume


class GroqResumeParser:
    def __init__(self) -> None:
        self._client = Groq(api_key=settings.groq_api_key)

    def parse_resume(self, text: str) -> ParsedResume:
        response = self._client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract resume information as strict JSON matching this shape: "
                        "{full_name,email,phone,location,summary,skills,experience,education}. "
                        "Return JSON only."
                    ),
                },
                {"role": "user", "content": text},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        if raw is None:
            raise ValueError("Groq returned an empty response")

        try:
            payload: dict[str, Any] = json.loads(raw)
            return ParsedResume.model_validate(payload)
        except (json.JSONDecodeError, ValidationError) as exc:
            raise ValueError("Groq response failed validation") from exc
