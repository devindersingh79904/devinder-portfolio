import os
from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.rate_limit import limiter
from app.schemas.common import APIResponse
from app.utils.response import success_response
from app.core.exceptions import PortfolioException, ErrorCodes
from app.schemas.portfolio import (
    JDQueryCreate, ContactLeadCreate, ProfileOut, ProjectOut, 
    ExperienceOut, EducationOut, CertificationOut, SkillOut
)
from app.repositories.portfolio import (
    profile_repo, project_repo, experience_repo, 
    education_repo, certification_repo, skill_repo
)
from app.repositories.queries import contact_lead_repo
from app.services.jd_match import calculate_jd_match

router = APIRouter(prefix="/api/v1")

@router.get("/profile", response_model=APIResponse[ProfileOut])
def get_profile(db: Session = Depends(get_db)):
    # Assuming only one profile exists for the MVP
    profiles = profile_repo.get_multi(db, limit=1)
    if not profiles:
        raise PortfolioException("Profile not found", ErrorCodes.NOT_FOUND, 404)
    return success_response(data=profiles[0])

@router.get("/profile/resume/download")
def download_resume(request: Request, db: Session = Depends(get_db)):
    profiles = profile_repo.get_multi(db, limit=1)
    if not profiles or not profiles[0].resume_url:
        raise PortfolioException("Resume not found", ErrorCodes.NOT_FOUND, 404)
        
    file_path = profiles[0].resume_url
    if not os.path.exists(file_path):
        raise PortfolioException("Resume file missing from storage", ErrorCodes.NOT_FOUND, 404)
        
    # Log analytics event
    from app.repositories.analytics import analytics_event_repo
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    analytics_event_repo.create(db, obj_in={
        "event_type": "RESUME_DOWNLOAD", 
        "metadata_json": {"file_name": profiles[0].resume_file_name},
        "ip_address": client_ip,
        "user_agent": user_agent
    })
    
    return FileResponse(path=file_path, filename=profiles[0].resume_file_name, media_type="application/pdf")

@router.get("/projects", response_model=APIResponse[list[ProjectOut]])
def get_projects(db: Session = Depends(get_db)):
    projects = project_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=projects)

@router.get("/projects/{projectId}", response_model=APIResponse[ProjectOut])
def get_project(projectId: str, db: Session = Depends(get_db)):
    project = project_repo.get(db, projectId)
    if not project or not project.is_active:
        raise PortfolioException("Project not found", ErrorCodes.NOT_FOUND, 404)
    return success_response(data=project)

@router.get("/experience", response_model=APIResponse[list[ExperienceOut]])
def get_experience(db: Session = Depends(get_db)):
    experiences = experience_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=experiences)

@router.get("/education", response_model=APIResponse[list[EducationOut]])
def get_education(db: Session = Depends(get_db)):
    educations = education_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=educations)

@router.get("/certifications", response_model=APIResponse[list[CertificationOut]])
def get_certifications(db: Session = Depends(get_db)):
    certs = certification_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=certs)

@router.get("/skills", response_model=APIResponse[list[SkillOut]])
def get_skills(db: Session = Depends(get_db)):
    skills = skill_repo.get_multi(db, filters={"is_active": True})
    return success_response(data=skills)

@router.post("/contact", response_model=APIResponse)
@limiter.limit("5/hour")
def submit_contact(request: Request, contact: ContactLeadCreate, db: Session = Depends(get_db)):
    data = contact.model_dump()
    data["ip_address"] = request.client.host if request.client else None
    data["user_agent"] = request.headers.get("user-agent")
    data["source"] = "public_web"
    contact_lead_repo.create(db, obj_in=data)
    
    # Log analytics
    from app.repositories.analytics import analytics_event_repo
    analytics_event_repo.create(db, obj_in={
        "event_type": "CONTACT_FORM_SUBMIT",
        "ip_address": data["ip_address"],
        "user_agent": data["user_agent"]
    })
    return success_response(message="Contact lead submitted successfully")

@router.post("/jd-match", response_model=APIResponse)
@limiter.limit("5/hour")
def submit_jd_match(request: Request, query: JDQueryCreate, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    result = calculate_jd_match(db, query, ip_address=client_ip, user_agent=user_agent)
    
    # Log analytics
    from app.repositories.analytics import analytics_event_repo
    analytics_event_repo.create(db, obj_in={
        "event_type": "JD_MATCH_SUBMIT",
        "ip_address": client_ip,
        "user_agent": user_agent
    })
    return success_response(data=result.model_dump(), message="JD match calculated successfully")

@router.post("/analytics/events", response_model=APIResponse)
def submit_analytics_event(request: Request, event: dict, db: Session = Depends(get_db)):
    from app.repositories.analytics import analytics_event_repo
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    event_type = event.get("event_type", "UNKNOWN")
    metadata_json = event.get("metadata_json", {})
    page_url = event.get("page_url", None)
    
    analytics_event_repo.create(db, obj_in={
        "event_type": event_type, 
        "metadata_json": metadata_json,
        "page_url": page_url,
        "ip_address": client_ip,
        "user_agent": user_agent
    })
    return success_response()
