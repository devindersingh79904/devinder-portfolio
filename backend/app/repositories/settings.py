from sqlalchemy.orm import Session

from app.repositories.base import BaseRepository
from app.models.settings import SiteSettings
from app.schemas.portfolio import SiteSettingsUpdate

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
