from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.resume import ResumeStatus


class ParsedExperience(BaseModel):
    company: str
    title: str
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None


class ParsedEducation(BaseModel):
    institution: str
    degree: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class ParsedResume(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    summary: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ParsedExperience] = Field(default_factory=list)
    education: list[ParsedEducation] = Field(default_factory=list)
    projects: list[dict[str, str]] = Field(default_factory=list)

    @field_validator("skills", "experience", "education", "projects", mode="before")
    @classmethod
    def none_to_empty_list(cls, value: object) -> object:
        if value is None:
            return []
        return value

    @model_validator(mode="before")
    @classmethod
    def normalize_name(cls, value: object) -> object:
        if isinstance(value, dict) and not value.get("full_name") and value.get("name"):
            value["full_name"] = value["name"]
        return value


class ResumeUploadResponse(BaseModel):
    id: UUID
    status: ResumeStatus


class ResumeRead(BaseModel):
    id: UUID
    filename: str
    status: ResumeStatus
    parsed_data: ParsedResume | None = None
    error_message: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
