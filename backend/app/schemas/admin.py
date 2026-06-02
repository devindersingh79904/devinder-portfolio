from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.portfolio import JDQueryOut, ContactLeadOut

class AdminLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DashboardStats(BaseModel):
    totalJdQueries: int
    averageMatchScore: float
    totalContactLeads: int
    totalResumeDownloads: int
    recentJdQueries: List[JDQueryOut]
    recentContactLeads: List[ContactLeadOut]
