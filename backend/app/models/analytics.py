from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import BaseModel

class AnalyticsEvent(BaseModel):
    __tablename__ = "analytics_events"

    event_type = Column(String, nullable=False, index=True)
    metadata_json = Column(JSONB, nullable=True)
