from sqlalchemy import Column, String, Text, Boolean, Integer, Date
from app.db.base import BaseModel

class Project(BaseModel):
    __tablename__ = "projects"

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    link = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    updated_by = Column(String, nullable=True)

class Experience(BaseModel):
    __tablename__ = "experience"

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True) # Null means present
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    updated_by = Column(String, nullable=True)

class Education(BaseModel):
    __tablename__ = "education"

    degree = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    updated_by = Column(String, nullable=True)

class Certification(BaseModel):
    __tablename__ = "certifications"

    name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    link = Column(String, nullable=True)
    date_issued = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    updated_by = Column(String, nullable=True)

class Skill(BaseModel):
    __tablename__ = "skills"

    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    updated_by = Column(String, nullable=True)
