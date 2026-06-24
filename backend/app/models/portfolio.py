from sqlalchemy import Column, String, Text, Boolean, Integer, Date
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import BaseModel

class Project(BaseModel):
    __tablename__ = "projects"

    title = Column(String, nullable=False)
    short_description = Column(String, nullable=True)
    detailed_description = Column(Text, nullable=True)
    problem_solved = Column(Text, nullable=True)
    tech_stack = Column(JSONB, nullable=True)
    features = Column(JSONB, nullable=True)
    github_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)
    demo_url = Column(String, nullable=True)
    architecture_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    updated_by = Column(String, nullable=True)

class Experience(BaseModel):
    __tablename__ = "experience"

    company_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True) 
    is_current = Column(Boolean, default=False)
    summary = Column(Text, nullable=True)
    tech_stack = Column(JSONB, nullable=True)
    achievements = Column(JSONB, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    updated_by = Column(String, nullable=True)

class Education(BaseModel):
    __tablename__ = "education"

    institution_name = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=True)
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    grade = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    updated_by = Column(String, nullable=True)

class Certification(BaseModel):
    __tablename__ = "certifications"

    title = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    skills = Column(JSONB, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    updated_by = Column(String, nullable=True)

class Skill(BaseModel):
    __tablename__ = "skills"

    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    proficiency = Column(String, nullable=True)  # Beginner | Intermediate | Advanced | Expert
    years_of_experience = Column(Integer, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    updated_by = Column(String, nullable=True)
