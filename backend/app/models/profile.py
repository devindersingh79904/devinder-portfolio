from sqlalchemy import Column, String, Text, DateTime
from app.db.base import BaseModel

class Profile(BaseModel):
    __tablename__ = "profile"

    full_name = Column(String, nullable=False)
    headline = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    
    # Resume Management
    resume_url = Column(String, nullable=True)
    resume_file_name = Column(String, nullable=True)
    resume_updated_at = Column(DateTime(timezone=True), nullable=True)
