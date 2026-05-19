"""create resumes table

Revision ID: 0001_create_resumes
Revises:
Create Date: 2026-05-10
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_create_resumes"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    status = postgresql.ENUM("pending", "processing", "completed", "failed", name="resumestatus", create_type=False)
    status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "resumes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("status", status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "parsed_resumes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("resume_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("skills", sa.JSON(), nullable=False),
        sa.Column("education", sa.JSON(), nullable=False),
        sa.Column("experience", sa.JSON(), nullable=False),
        sa.Column("projects", sa.JSON(), nullable=False),
        sa.Column("raw_llm_response", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("resume_id"),
    )
    op.create_index("ix_parsed_resumes_resume_id", "parsed_resumes", ["resume_id"])


def downgrade() -> None:
    op.drop_index("ix_parsed_resumes_resume_id", table_name="parsed_resumes")
    op.drop_table("parsed_resumes")
    op.drop_table("resumes")
    status = postgresql.ENUM("pending", "processing", "completed", "failed", name="resumestatus", create_type=False)
    status.drop(op.get_bind(), checkfirst=True)
