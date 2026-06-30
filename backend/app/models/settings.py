from sqlalchemy import Column, Boolean, String
from app.db.base import BaseModel

class SiteSettings(BaseModel):
    __tablename__ = "site_settings"

    # Feature flags (single-row table, mirrors the Profile pattern).
    jd_match_enabled = Column(Boolean, default=True, nullable=False)

    # Public section visibility toggles (admin-controlled).
    projects_enabled = Column(Boolean, default=True, nullable=False)
    skills_enabled = Column(Boolean, default=True, nullable=False)
    experience_enabled = Column(Boolean, default=True, nullable=False)
    education_enabled = Column(Boolean, default=True, nullable=False)
    certifications_enabled = Column(Boolean, default=True, nullable=False)
    contact_enabled = Column(Boolean, default=True, nullable=False)
    resume_enabled = Column(Boolean, default=True, nullable=False)
    analytics_enabled = Column(Boolean, default=True, nullable=False)

    # Dynamic AI / JD-match config. These override the env defaults when set,
    # so credentials/model can be changed from the admin panel ("env OR dynamic").
    jd_match_llm_enabled = Column(Boolean, default=True, nullable=False)
    jd_match_model = Column(String, nullable=True)   # falls back to settings.JD_MATCH_MODEL
    anthropic_api_key = Column(String, nullable=True)  # falls back to settings.ANTHROPIC_API_KEY (secret)
