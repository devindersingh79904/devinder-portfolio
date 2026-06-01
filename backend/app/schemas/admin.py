from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.portfolio import JDQueryOut, ContactLeadOut

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DashboardStats(BaseModel):
    total_jd_queries: int
    average_match_score: float
    total_contact_leads: int
    total_resume_downloads: int
    recent_jd_queries: List[JDQueryOut]
    recent_contact_leads: List[ContactLeadOut]
