from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class SkillBase(ORMBase):
    name: str
    category: str
    is_active: bool = True
    display_order: int = 0

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    name: Optional[str] = None
    category: Optional[str] = None

class SkillOut(SkillBase):
    id: UUID
    
class ProjectBase(ORMBase):
    title: str
    description: str
    link: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    display_order: int = 0

class ProjectCreate(ProjectBase):
    pass
    
class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    description: Optional[str] = None

class ProjectOut(ProjectBase):
    id: UUID

class ExperienceBase(ORMBase):
    company: str
    role: str
    description: str
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True
    display_order: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(ExperienceBase):
    company: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None

class ExperienceOut(ExperienceBase):
    id: UUID

class EducationBase(ORMBase):
    degree: str
    institution: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True
    display_order: int = 0

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase):
    degree: Optional[str] = None
    institution: Optional[str] = None

class EducationOut(EducationBase):
    id: UUID

class CertificationBase(ORMBase):
    name: str
    issuer: str
    link: Optional[str] = None
    date_issued: Optional[date] = None
    is_active: bool = True
    display_order: int = 0

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(CertificationBase):
    name: Optional[str] = None
    issuer: Optional[str] = None

class CertificationOut(CertificationBase):
    id: UUID

class ProfileBase(ORMBase):
    name: str
    title: str
    bio: Optional[str] = None
    email: str

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None

class ProfileOut(ProfileBase):
    id: UUID
    resume_url: Optional[str] = None
    resume_file_name: Optional[str] = None
    resume_updated_at: Optional[datetime] = None

class ContactLeadCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    subject: str
    message: str

class ContactLeadOut(ContactLeadCreate, ORMBase):
    id: UUID
    created_at: datetime

class JDQueryCreate(BaseModel):
    hr_name: Optional[str] = None
    hr_email: Optional[str] = None
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    jd_text: str

class JDMatchResult(BaseModel):
    matchScore: float
    matchedSkills: List[str]
    missingSkills: List[str]
    weakSkills: List[str]
    relevantProjects: List[Dict[str, Any]]
    relevantExperience: List[Dict[str, Any]]
    summary: str

class JDQueryOut(ORMBase):
    id: UUID
    query_text: str
    match_score: float
    result_json: JDMatchResult
    created_at: datetime
