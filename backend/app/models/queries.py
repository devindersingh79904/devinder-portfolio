from sqlalchemy import Column, String, Text, Float
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import BaseModel

class JDQuery(BaseModel):
    __tablename__ = "jd_queries"

    query_text = Column(Text, nullable=False)
    match_score = Column(Float, nullable=False)
    result_json = Column(JSONB, nullable=False)

class ContactLead(BaseModel):
    __tablename__ = "contact_leads"

    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
