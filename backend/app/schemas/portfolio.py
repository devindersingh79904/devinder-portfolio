from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

class ORMBase(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True
    )

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

# -----------------
# SKILLS
# -----------------
class SkillBase(ORMBase):
    name: str
    category: str
    proficiency: Optional[int] = None
    years_of_experience: Optional[int] = None
    display_order: int = 0
    is_active: bool = True

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    name: Optional[str] = None
    category: Optional[str] = None

class SkillOut(SkillBase):
    id: UUID

# -----------------
# PROJECTS
# -----------------
class ProjectBase(ORMBase):
    title: str
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    problem_solved: Optional[str] = None
    tech_stack: Optional[Dict[str, Any]] = None
    features: Optional[Dict[str, Any]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    demo_url: Optional[str] = None
    architecture_url: Optional[str] = None
    display_order: int = 0
    is_featured: bool = False
    is_active: bool = True

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None

class ProjectOut(ProjectBase):
    id: UUID

# -----------------
# EXPERIENCE
# -----------------
class ExperienceBase(ORMBase):
    company_name: str
    role: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    summary: Optional[str] = None
    tech_stack: Optional[Dict[str, Any]] = None
    achievements: Optional[Dict[str, Any]] = None
    display_order: int = 0
    is_active: bool = True

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(ExperienceBase):
    company_name: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[date] = None

class ExperienceOut(ExperienceBase):
    id: UUID

# -----------------
# EDUCATION
# -----------------
class EducationBase(ORMBase):
    institution_name: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase):
    institution_name: Optional[str] = None
    degree: Optional[str] = None

class EducationOut(EducationBase):
    id: UUID

# -----------------
# CERTIFICATIONS
# -----------------
class CertificationBase(ORMBase):
    title: str
    issuer: str
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    skills: Optional[Dict[str, Any]] = None
    display_order: int = 0
    is_active: bool = True

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(CertificationBase):
    title: Optional[str] = None
    issuer: Optional[str] = None

class CertificationOut(CertificationBase):
    id: UUID

# -----------------
# PROFILE
# -----------------
class ProfileBase(ORMBase):
    full_name: str
    headline: str
    summary: Optional[str] = None
    location: Optional[str] = None
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    profile_image_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    email: Optional[str] = None

class ProfileOut(ProfileBase):
    id: UUID
    resume_url: Optional[str] = None
    resume_file_name: Optional[str] = None
    resume_updated_at: Optional[datetime] = None

# -----------------
# CONTACT LEADS
# -----------------
class ContactLeadCreate(BaseSchema):
    name: str
    email: str
    company: Optional[str] = None
    subject: str
    message: str

class ContactLeadOut(ContactLeadCreate, ORMBase):
    id: UUID
    created_at: datetime
    source: Optional[str] = None

# -----------------
# JD QUERIES
# -----------------
from pydantic import BaseModel, ConfigDict, Field

class JDQueryCreate(BaseModel):
    hr_name: Optional[str] = Field(default=None, alias="hrName")
    hr_email: Optional[str] = Field(default=None, alias="hrEmail")
    company_name: Optional[str] = Field(default=None, alias="companyName")
    role_title: Optional[str] = Field(default=None, alias="roleTitle")
    jd_text: str = Field(..., alias="jdText")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

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
    hrName: Optional[str] = Field(None, validation_alias="hr_name")
    hrEmail: Optional[str] = Field(None, validation_alias="hr_email")
    companyName: Optional[str] = Field(None, validation_alias="company_name")
    roleTitle: Optional[str] = Field(None, validation_alias="role_title")
    jdText: str = Field(..., validation_alias="jd_text")
    matchScore: float = Field(..., validation_alias="match_score")
    resultJson: Optional[JDMatchResult] = Field(None, validation_alias="result_json")
    createdAt: datetime = Field(..., validation_alias="created_at")

# -----------------
# ANALYTICS
# -----------------
class AnalyticsEventCreate(BaseModel):
    event_type: str = Field(..., alias="eventType")
    page_url: Optional[str] = Field(None, alias="pageUrl")
    metadata_json: Optional[Dict[str, Any]] = Field(None, alias="metadata")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

class AnalyticsEventOut(AnalyticsEventCreate, ORMBase):
    id: UUID
    created_at: datetime
