from sqlalchemy import Column, Boolean
from app.db.base import BaseModel

class SiteSettings(BaseModel):
    __tablename__ = "site_settings"

    # Feature flags (single-row table, mirrors the Profile pattern).
    jd_match_enabled = Column(Boolean, default=True, nullable=False)
