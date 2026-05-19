from __future__ import annotations

import uuid

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.logging import get_logger
from app.models.resume import ParsedResume, Resume, ResumeStatus
from app.services.groq_service import GroqResumeParser
from app.services.pdf_service import extract_pdf_text_from_bytes
from app.workers.celery_app import celery_app

logger = get_logger(__name__)
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


@celery_app.task(name="process_resume")
def process_resume(resume_id: str) -> None:
    parsed_id = uuid.UUID(resume_id)
    with SessionLocal() as session:
        resume = _get_resume(session, parsed_id)
        try:
            resume.status = ResumeStatus.processing
            session.commit()

            if not resume.pdf_content:
                raise ValueError("Resume PDF content is missing")

            text = extract_pdf_text_from_bytes(resume.pdf_content)
            parsed = GroqResumeParser().parse_resume(text)
            parsed_payload = parsed.model_dump(mode="json")

            session.add(
                ParsedResume(
                    resume_id=resume.id,
                    name=parsed.full_name,
                    email=parsed.email,
                    skills=parsed.skills,
                    education=[item.model_dump(mode="json") for item in parsed.education],
                    experience=[item.model_dump(mode="json") for item in parsed.experience],
                    projects=parsed.projects,
                    raw_llm_response=parsed_payload,
                )
            )
            resume.status = ResumeStatus.completed
            session.commit()
            logger.info("resume_processed", resume_id=resume_id)
        except Exception as exc:
            session.rollback()
            resume = _get_resume(session, parsed_id)
            resume.status = ResumeStatus.failed
            session.commit()
            logger.exception("resume_processing_failed", resume_id=resume_id, error=str(exc))
            raise


def _get_resume(session: Session, resume_id: uuid.UUID) -> Resume:
    resume = session.execute(select(Resume).where(Resume.id == resume_id)).scalar_one()
    return resume
