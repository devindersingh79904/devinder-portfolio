import csv
import os
import shutil
from datetime import datetime, timezone
from io import StringIO
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.constants import (
    ADMIN_CERTIFICATION_DETAIL_PATH,
    ADMIN_CERTIFICATIONS_PATH,
    ADMIN_CONTACT_LEADS_EXPORT_PATH,
    ADMIN_CONTACT_LEAD_DETAIL_PATH,
    ADMIN_CONTACT_LEADS_PATH,
    ADMIN_DASHBOARD_STATS_PATH,
    ADMIN_EDUCATION_DETAIL_PATH,
    ADMIN_EDUCATION_PATH,
    ADMIN_EXPERIENCE_DETAIL_PATH,
    ADMIN_EXPERIENCE_PATH,
    ADMIN_JD_QUERIES_EXPORT_PATH,
    ADMIN_JD_QUERY_DETAIL_PATH,
    ADMIN_JD_QUERIES_PATH,
    ADMIN_LOGIN_PATH,
    ADMIN_PREFIX,
    ADMIN_PROFILE_PATH,
    ADMIN_PROFILE_RESUME_PATH,
    ADMIN_PROJECT_DETAIL_PATH,
    ADMIN_PROJECTS_PATH,
    ADMIN_SKILL_DETAIL_PATH,
    ADMIN_SKILLS_PATH,
    CSV_CONTACT_LEADS_FILENAME,
    CSV_JD_QUERIES_FILENAME,
)
from app.core.exceptions import ErrorCodes, PortfolioException
from app.core.security import create_access_token, verify_password
from app.db.database import get_db
from app.models.admin import AdminUser
from app.models.analytics import AnalyticsEvent
from app.models.queries import JDQuery
from app.repositories.portfolio import (
    certification_repo,
    education_repo,
    experience_repo,
    project_repo,
    skill_repo,
)
from app.repositories.profile import profile_repo
from app.repositories.queries import contact_lead_repo, jd_query_repo
from app.routers.deps import get_current_admin
from app.schemas.admin import AdminLogin, DashboardStats, Token
from app.schemas.common import APIResponse
from app.schemas.portfolio import (
    CertificationCreate,
    CertificationOut,
    CertificationUpdate,
    ContactLeadOut,
    EducationCreate,
    EducationOut,
    EducationUpdate,
    ExperienceCreate,
    ExperienceOut,
    ExperienceUpdate,
    JDQueryOut,
    ProfileOut,
    ProfileUpdate,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    SkillCreate,
    SkillOut,
    SkillUpdate,
)
from app.utils.pagination import build_pagination
from app.utils.response import success_response

router = APIRouter(prefix=f"/api/v1{ADMIN_PREFIX}")

@router.post(ADMIN_LOGIN_PATH, response_model=APIResponse[Token])
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == credentials.email).first()
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise PortfolioException("Incorrect email or password", ErrorCodes.AUTH_ERROR, 401)
    
    access_token = create_access_token(data={"sub": admin.email, "type": "admin"})
    return success_response(data=Token(access_token=access_token, token_type="bearer").model_dump())

@router.get(ADMIN_PROFILE_PATH, response_model=APIResponse[ProfileOut])
def get_admin_profile(db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    profiles = profile_repo.get_multi(db, limit=1)
    if not profiles:
        raise PortfolioException("Profile not found", ErrorCodes.NOT_FOUND, 404)
    return success_response(data=profiles[0])

@router.put(ADMIN_PROFILE_PATH, response_model=APIResponse[ProfileOut])
def update_admin_profile(profile_update: ProfileUpdate, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    profiles = profile_repo.get_multi(db, limit=1)
    if not profiles:
        # Create it if it doesn't exist
        new_profile = profile_repo.create(db, obj_in=profile_update.model_dump(exclude_unset=True))
        return success_response(data=new_profile)
    
    updated_profile = profile_repo.update(db, db_obj=profiles[0], obj_in=profile_update)
    return success_response(data=updated_profile)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "resume")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post(ADMIN_PROFILE_RESUME_PATH, response_model=APIResponse)
def upload_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_admin: AdminUser = Depends(get_current_admin)
):
    if not file.filename.lower().endswith('.pdf'):
        raise PortfolioException("Only PDF files are allowed", ErrorCodes.VALIDATION_ERROR, 400)
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 10 * 1024 * 1024:
        raise PortfolioException("File size must be under 10MB", ErrorCodes.VALIDATION_ERROR, 400)
        
    file_path = os.path.join(UPLOAD_DIR, "latest-resume.pdf")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    profiles = profile_repo.get_multi(db, limit=1)
    if profiles:
        profiles[0].resume_url = file_path
        profiles[0].resume_file_name = file.filename
        profiles[0].resume_updated_at = datetime.now(timezone.utc)
        db.commit()
        
    return success_response(message="Resume uploaded successfully")

# Generic CRUD generator
def register_crud(router: APIRouter, path: str, path_detail: str, repo, out_schema, create_schema, update_schema):
    @router.get(path)
    def read_items(page: int = 0, size: int = 10, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
        total = repo.count(db, filters={"is_active": True})
        items = repo.get_multi(db, skip=page*size, limit=size, filters={"is_active": True})
        schema_items = [out_schema.model_validate(item) for item in items]
        return success_response(data=build_pagination(schema_items, page, size, total).model_dump(by_alias=True))
        
    @router.get(path_detail)
    def read_item(item_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
        item = repo.get(db, item_id)
        if not item or not item.is_active:
            raise PortfolioException("Item not found", ErrorCodes.NOT_FOUND, 404)
        return success_response(data=item)
        
    @router.post(path)
    def create_item(item_in: create_schema, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
        data = item_in.model_dump()
        data["updated_by"] = current_admin.email
        item = repo.create(db, obj_in=data)
        return success_response(data=item)
        
    @router.put(path_detail)
    def update_item(item_id: str, item_in: update_schema, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
        item = repo.get(db, item_id)
        if not item or not item.is_active:
            raise PortfolioException("Item not found", ErrorCodes.NOT_FOUND, 404)
        data = item_in.model_dump(exclude_unset=True)
        data["updated_by"] = current_admin.email
        item = repo.update(db, db_obj=item, obj_in=data)
        return success_response(data=item)
        
    @router.delete(path_detail)
    def delete_item(item_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
        item = repo.soft_delete(db, id=item_id)
        if not item:
            raise PortfolioException("Item not found", ErrorCodes.NOT_FOUND, 404)
        return success_response(message="Item deleted successfully")

register_crud(router, ADMIN_PROJECTS_PATH, ADMIN_PROJECT_DETAIL_PATH, project_repo, ProjectOut, ProjectCreate, ProjectUpdate)
register_crud(router, ADMIN_EXPERIENCE_PATH, ADMIN_EXPERIENCE_DETAIL_PATH, experience_repo, ExperienceOut, ExperienceCreate, ExperienceUpdate)
register_crud(router, ADMIN_EDUCATION_PATH, ADMIN_EDUCATION_DETAIL_PATH, education_repo, EducationOut, EducationCreate, EducationUpdate)
register_crud(router, ADMIN_CERTIFICATIONS_PATH, ADMIN_CERTIFICATION_DETAIL_PATH, certification_repo, CertificationOut, CertificationCreate, CertificationUpdate)
register_crud(router, ADMIN_SKILLS_PATH, ADMIN_SKILL_DETAIL_PATH, skill_repo, SkillOut, SkillCreate, SkillUpdate)

# Queries and Leads
@router.get(ADMIN_JD_QUERIES_PATH)
def get_jd_queries(page: int = 0, size: int = 10, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    total = jd_query_repo.count(db)
    items = jd_query_repo.get_multi(db, skip=page*size, limit=size)
    schema_items = [JDQueryOut.model_validate(item) for item in items]
    return success_response(data=build_pagination(schema_items, page, size, total).model_dump(by_alias=True))

@router.delete(ADMIN_JD_QUERY_DETAIL_PATH)
def delete_jd_query(query_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    jd_query_repo.remove(db, id=query_id)
    return success_response(message="Query deleted successfully")

@router.get(ADMIN_CONTACT_LEADS_PATH)
def get_contact_leads(page: int = 0, size: int = 10, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    total = contact_lead_repo.count(db)
    items = contact_lead_repo.get_multi(db, skip=page*size, limit=size)
    schema_items = [ContactLeadOut.model_validate(item) for item in items]
    return success_response(data=build_pagination(schema_items, page, size, total).model_dump(by_alias=True))

@router.delete(ADMIN_CONTACT_LEAD_DETAIL_PATH)
def delete_contact_lead(lead_id: str, db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    contact_lead_repo.remove(db, id=lead_id)
    return success_response(message="Lead deleted successfully")

# Exports
@router.get(ADMIN_CONTACT_LEADS_EXPORT_PATH)
def export_contact_leads(db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    leads = contact_lead_repo.get_multi(db, limit=10000)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Company", "Subject", "Message", "Created At"])
    for lead in leads:
        writer.writerow([str(lead.id), lead.name, lead.email, lead.company, lead.subject, lead.message, lead.created_at.isoformat()])
        
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={CSV_CONTACT_LEADS_FILENAME}"})

@router.get(ADMIN_JD_QUERIES_EXPORT_PATH)
def export_jd_queries(db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    queries = jd_query_repo.get_multi(db, limit=10000)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "HR Name", "HR Email", "Company", "Role Title", "JD Text", "Match Score", "Matched Skills", "Missing Skills", "Weak Skills", "Summary", "Created At"])
    for q in queries:
        writer.writerow([
            str(q.id), 
            q.hr_name, 
            q.hr_email, 
            q.company_name, 
            q.role_title, 
            q.jd_text, 
            q.match_score, 
            ", ".join(q.matched_skills) if q.matched_skills else "",
            ", ".join(q.missing_skills) if q.missing_skills else "",
            ", ".join(q.weak_skills) if q.weak_skills else "",
            q.summary,
            q.created_at.isoformat()
        ])
        
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={CSV_JD_QUERIES_FILENAME}"})

@router.get(ADMIN_DASHBOARD_STATS_PATH, response_model=APIResponse[DashboardStats])
def get_dashboard_stats(db: Session = Depends(get_db), current_admin: AdminUser = Depends(get_current_admin)):
    total_jd_queries = jd_query_repo.count(db)
    avg_score_row = db.query(func.avg(JDQuery.match_score)).first()
    average_match_score = float(avg_score_row[0]) if avg_score_row and avg_score_row[0] else 0.0
    total_contact_leads = contact_lead_repo.count(db)
    total_resume_downloads = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == "RESUME_DOWNLOAD").count()
    
    recent_jd = jd_query_repo.get_multi(db, limit=5)
    recent_leads = contact_lead_repo.get_multi(db, limit=5)
    
    return success_response(data=DashboardStats(
        totalJdQueries=total_jd_queries,
        averageMatchScore=round(average_match_score, 2),
        totalContactLeads=total_contact_leads,
        totalResumeDownloads=total_resume_downloads,
        recentJdQueries=[JDQueryOut.model_validate(q) for q in recent_jd],
        recentContactLeads=[ContactLeadOut.model_validate(l) for l in recent_leads]
    ).model_dump(by_alias=True))
