"""Add section visibility flags and dynamic AI/JD config to site_settings

Revision ID: 003
Revises: 002
Create Date: 2026-06-30 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

BOOL_FLAGS = [
    "projects_enabled",
    "skills_enabled",
    "experience_enabled",
    "education_enabled",
    "certifications_enabled",
    "contact_enabled",
    "resume_enabled",
    "analytics_enabled",
    "jd_match_llm_enabled",
]

def upgrade():
    for col in BOOL_FLAGS:
        op.add_column(
            "site_settings",
            sa.Column(col, sa.Boolean(), server_default=sa.true(), nullable=False),
        )
    op.add_column("site_settings", sa.Column("jd_match_model", sa.String(), nullable=True))
    op.add_column("site_settings", sa.Column("anthropic_api_key", sa.String(), nullable=True))

def downgrade():
    op.drop_column("site_settings", "anthropic_api_key")
    op.drop_column("site_settings", "jd_match_model")
    for col in reversed(BOOL_FLAGS):
        op.drop_column("site_settings", col)
