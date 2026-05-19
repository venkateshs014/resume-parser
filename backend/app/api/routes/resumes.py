from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session
from app.schemas.resume import ResumeRead, ResumeUploadResponse
from app.services.resume_service import ResumeService

router = APIRouter(tags=["resumes"])


@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_resume(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db_session),
) -> ResumeUploadResponse:
    service = ResumeService(session)
    return await service.create_from_upload(file)


@router.get("/resume/{resume_id}", response_model=ResumeRead)
async def get_resume(
    resume_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ResumeRead:
    service = ResumeService(session)
    return await service.get_resume(resume_id)
