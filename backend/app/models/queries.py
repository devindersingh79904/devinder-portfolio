from sqlalchemy import Column, String, Text, Float
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import BaseModel

class JDQuery(BaseModel):
    __tablename__ = "jd_queries"

    hr_name = Column(String, nullable=True)
    hr_email = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    role_title = Column(String, nullable=True)
    jd_text = Column(Text, nullable=False)
    
    match_score = Column(Float, nullable=False)
    matched_skills = Column(JSONB, nullable=True)
    missing_skills = Column(JSONB, nullable=True)
    weak_skills = Column(JSONB, nullable=True)
    relevant_projects = Column(JSONB, nullable=True)
    relevant_experience = Column(JSONB, nullable=True)
    summary = Column(Text, nullable=True)
    
    result_json = Column(JSONB, nullable=True)
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

class ContactLead(BaseModel):
    __tablename__ = "contact_leads"

    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    source = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
