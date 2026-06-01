from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import BaseModel

class AnalyticsEvent(BaseModel):
    __tablename__ = "analytics_events"

    event_type = Column(String, nullable=False, index=True)
    page_url = Column(String, nullable=True)
    metadata_json = Column(JSONB, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
