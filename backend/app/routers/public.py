import os

from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.constants import (
    API_V1_PREFIX,
    CERTIFICATIONS_PATH,
    CONTACT_PATH,
    EDUCATION_PATH,
    EVENT_CONTACT_FORM_SUBMITTED,
    EVENT_JD_MATCH_SUBMITTED,
    EVENT_RESUME_DOWNLOAD,
    EVENTS_PATH,
    EXPERIENCE_PATH,
    JD_MATCH_PATH,
    PROFILE_PATH,
    PROJECT_DETAIL_PATH,
    PROJECTS_PATH,
    RESUME_DOWNLOAD_PATH,
    SKILLS_PATH,
)
from app.core.exceptions import ErrorCodes, PortfolioException
from app.core.rate_limit import limiter
from app.db.database import get_db
from app.repositories.analytics import analytics_event_repo
from app.repositories.portfolio import (
    certification_repo,
    education_repo,
    experience_repo,
    project_repo,
    skill_repo,
)
from app.repositories.profile import profile_repo
from app.repositories.queries import contact_lead_repo
from app.schemas.common import APIResponse
from app.schemas.portfolio import (
    AnalyticsEventCreate,
    CertificationOut,
    ContactLeadCreate,
    EducationOut,
    ExperienceOut,
    JDQueryCreate,
    ProfileOut,
    ProjectOut,
    SkillOut,
)
from app.services.jd_match import calculate_jd_match
from app.utils.response import success_response

router = APIRouter(prefix=API_V1_PREFIX)

@router.get(PROFILE_PATH, response_model=APIResponse[ProfileOut])
def get_profile(db: Session = Depends(get_db)):
    # Assuming only one profile exists for the MVP
    profiles = profile_repo.get_multi(db, limit=1)
    if not profiles:
        raise PortfolioException("Profile not found", ErrorCodes.NOT_FOUND, 404)
    return success_response(data=profiles[0])

@router.get(RESUME_DOWNLOAD_PATH)
def download_resume(request: Request, db: Session = Depends(get_db)):
    profiles = profile_repo.get_multi(db, limit=1)
    if not profiles or not profiles[0].resume_url:
        raise PortfolioException("Resume not found", ErrorCodes.NOT_FOUND, 404)
        
    file_path = profiles[0].resume_url
    if not os.path.exists(file_path):
        raise PortfolioException("Resume file missing from storage", ErrorCodes.NOT_FOUND, 404)
        
    # Log analytics event
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    analytics_event_repo.create(db, obj_in={
        "event_type": EVENT_RESUME_DOWNLOAD, 
        "metadata_json": {"file_name": profiles[0].resume_file_name},
        "ip_address": client_ip,
        "user_agent": user_agent
    })
    
    return FileResponse(path=file_path, filename=profiles[0].resume_file_name, media_type="application/pdf")

@router.get(PROJECTS_PATH, response_model=APIResponse[list[ProjectOut]])
def get_projects(db: Session = Depends(get_db)):
    projects = project_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=projects)

@router.get(PROJECT_DETAIL_PATH, response_model=APIResponse[ProjectOut])
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = project_repo.get(db, project_id)
    if not project or not project.is_active:
        raise PortfolioException("Project not found", ErrorCodes.NOT_FOUND, 404)
    return success_response(data=project)

@router.get(EXPERIENCE_PATH, response_model=APIResponse[list[ExperienceOut]])
def get_experience(db: Session = Depends(get_db)):
    experiences = experience_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=experiences)

@router.get(EDUCATION_PATH, response_model=APIResponse[list[EducationOut]])
def get_education(db: Session = Depends(get_db)):
    educations = education_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=educations)

@router.get(CERTIFICATIONS_PATH, response_model=APIResponse[list[CertificationOut]])
def get_certifications(db: Session = Depends(get_db)):
    certs = certification_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=certs)

@router.get(SKILLS_PATH, response_model=APIResponse[list[SkillOut]])
def get_skills(db: Session = Depends(get_db)):
    skills = skill_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=skills)

@router.post(CONTACT_PATH, response_model=APIResponse)
@limiter.limit("5/hour")
def submit_contact(request: Request, contact: ContactLeadCreate, db: Session = Depends(get_db)):
    data = contact.model_dump()
    data["ip_address"] = request.client.host if request.client else None
    data["user_agent"] = request.headers.get("user-agent")
    data["source"] = "public_web"
    contact_lead_repo.create(db, obj_in=data)
    
    # Log analytics
    analytics_event_repo.create(db, obj_in={
        "event_type": EVENT_CONTACT_FORM_SUBMITTED,
        "ip_address": data["ip_address"],
        "user_agent": data["user_agent"]
    })
    return success_response(message="Contact lead submitted successfully")

@router.post(JD_MATCH_PATH, response_model=APIResponse)
@limiter.limit("5/hour")
def submit_jd_match(request: Request, query: JDQueryCreate, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    result = calculate_jd_match(db, query, ip_address=client_ip, user_agent=user_agent)
    
    # Log analytics
    analytics_event_repo.create(db, obj_in={
        "event_type": EVENT_JD_MATCH_SUBMITTED,
        "ip_address": client_ip,
        "user_agent": user_agent
    })
    return success_response(data=result.model_dump(), message="JD match calculated successfully")

@router.post(EVENTS_PATH, response_model=APIResponse)
def submit_analytics_event(request: Request, event: AnalyticsEventCreate, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    analytics_event_repo.create(db, obj_in={
        "event_type": event.event_type, 
        "metadata_json": event.metadata_json,
        "page_url": event.page_url,
        "ip_address": client_ip,
        "user_agent": user_agent
    })
    return success_response()
