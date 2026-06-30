"""Add nullable seed_key to portfolio entities for idempotent seeding

Revision ID: 004
Revises: 003
Create Date: 2026-06-30 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None

TABLES = ["projects", "experience", "education", "certifications", "skills"]

def upgrade():
    for table in TABLES:
        op.add_column(table, sa.Column("seed_key", sa.String(), nullable=True))

def downgrade():
    for table in TABLES:
        op.drop_column(table, "seed_key")
