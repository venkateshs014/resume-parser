from __future__ import annotations

import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.resume import Resume, ResumeStatus
from app.schemas.resume import ResumeRead, ResumeUploadResponse
from app.workers.tasks import process_resume


class ResumeService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_from_upload(self, file: UploadFile) -> ResumeUploadResponse:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF uploads are supported")

        resume_id = uuid.uuid4()
        stored_filename = f"{resume_id}.pdf"
        content = await file.read()

        resume = Resume(
            id=resume_id,
            filename=file.filename or stored_filename,
            pdf_content=content,
            status=ResumeStatus.pending,
        )
        self._session.add(resume)
        await self._session.commit()

        process_resume.delay(str(resume.id))
        return ResumeUploadResponse(id=resume.id, status=resume.status)

    async def get_resume(self, resume_id: uuid.UUID) -> ResumeRead:
        result = await self._session.execute(
            select(Resume).options(selectinload(Resume.parsed_resume)).where(Resume.id == resume_id)
        )
        resume = result.scalar_one_or_none()
        if resume is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        parsed_data = None
        if resume.parsed_resume is not None:
            parsed_data = {
                "full_name": resume.parsed_resume.name or "Unknown candidate",
                "email": resume.parsed_resume.email,
                "skills": resume.parsed_resume.skills,
                "education": resume.parsed_resume.education,
                "experience": resume.parsed_resume.experience,
                "projects": resume.parsed_resume.projects,
            }
        return ResumeRead(
            id=resume.id,
            filename=resume.filename,
            status=resume.status,
            parsed_data=parsed_data,
            created_at=resume.created_at,
        )
