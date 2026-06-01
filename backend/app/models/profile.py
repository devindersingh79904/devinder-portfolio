from sqlalchemy import Column, String, Text, DateTime
from app.db.base import BaseModel

class Profile(BaseModel):
    __tablename__ = "profile"

    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    email = Column(String, nullable=False)
    
    # Resume Management
    resume_url = Column(String, nullable=True)
    resume_file_name = Column(String, nullable=True)
    resume_updated_at = Column(DateTime(timezone=True), nullable=True)
    
    updated_by = Column(String, nullable=True) # Optional updated_by logic for future
