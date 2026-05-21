from __future__ import annotations

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.db.session import get_engine

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> JSONResponse:
    try:
        async with get_engine().connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "degraded", "database": "error", "detail": exc.__class__.__name__},
        )

    return JSONResponse(content={"status": "ok", "database": "ok"})
