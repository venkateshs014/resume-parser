"""add resume pdf content

Revision ID: 0002_add_resume_pdf_content
Revises: 0001_create_resumes
Create Date: 2026-05-19
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0002_add_resume_pdf_content"
down_revision = "0001_create_resumes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("resumes", sa.Column("pdf_content", sa.LargeBinary(), nullable=True))


def downgrade() -> None:
    op.drop_column("resumes", "pdf_content")
