from app.repositories.base import BaseRepository
from app.models.analytics import AnalyticsEvent

class AnalyticsEventRepository(BaseRepository[AnalyticsEvent, dict, dict]):
    pass

analytics_event_repo = AnalyticsEventRepository(AnalyticsEvent)
