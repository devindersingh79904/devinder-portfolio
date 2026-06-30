from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.core.config import settings as app_settings
from app.repositories.base import BaseRepository
from app.models.settings import SiteSettings
from app.schemas.portfolio import SiteSettingsOut, SiteSettingsUpdate

class SiteSettingsRepository(BaseRepository[SiteSettings, SiteSettingsUpdate, SiteSettingsUpdate]):
    pass

site_settings_repo = SiteSettingsRepository(SiteSettings)

def get_or_create_settings(db: Session) -> SiteSettings:
    """Return the single site-settings row, creating it with defaults if absent."""
    settings_row = db.query(SiteSettings).first()
    if not settings_row:
        settings_row = SiteSettings()
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row

def resolve_jd_config(db: Session) -> Tuple[bool, str, Optional[str]]:
    """Effective JD-match LLM config: DB override first, then env/config defaults.

    Returns (llm_enabled, model, api_key).
    """
    row = get_or_create_settings(db)
    model = row.jd_match_model or app_settings.JD_MATCH_MODEL
    api_key = row.anthropic_api_key or app_settings.ANTHROPIC_API_KEY
    return bool(row.jd_match_llm_enabled), model, api_key

def settings_to_out(row: SiteSettings) -> SiteSettingsOut:
    """Serialize settings for the admin, computing the API-key status without
    ever exposing the raw secret."""
    custom_key = bool(row.anthropic_api_key)
    env_key = bool(app_settings.ANTHROPIC_API_KEY)
    source = "custom" if custom_key else ("env" if env_key else None)
    return SiteSettingsOut.model_validate(row).model_copy(update={
        "anthropic_api_key_configured": custom_key or env_key,
        "anthropic_api_key_source": source,
    })
