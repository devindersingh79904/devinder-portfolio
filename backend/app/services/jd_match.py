import json
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.schemas.portfolio import JDQueryCreate, JDMatchResult
from app.repositories.portfolio import skill_repo, project_repo, experience_repo, certification_repo
from app.repositories.queries import jd_query_repo

def normalize_text(text: str) -> str:
    return text.lower().strip()

def calculate_jd_match(db: Session, query: JDQueryCreate, ip_address: str = None, user_agent: str = None) -> JDMatchResult:
    # 1. Fetch all skills from DB
    all_skills = skill_repo.get_multi(db, limit=1000, filters={"is_active": True})
    known_skills = {normalize_text(s.name): s for s in all_skills}
    
    # 2. Extract matched skills by simple text search
    jd_normalized = normalize_text(query.jd_text)
    
    matched_skills = []
    missing_skills = [] # We might simulate missing skills or extract them if we have a broader dictionary
    
    # A simple keyword match
    for skill_name_norm, skill_obj in known_skills.items():
        if re.search(r'\b' + re.escape(skill_name_norm) + r'\b', jd_normalized):
            matched_skills.append(skill_obj.name)
            
    # For MVP, missing skills can be mocked or inferred if we had a predefined "tech dictionary"
    # Here, we will just use some generic ones if they are present in JD but not in our profile
    common_tech_dict = ["kubernetes", "graphql", "redis", "docker", "aws", "gcp", "azure", "react", "python", "java", "node.js"]
    for tech in common_tech_dict:
        if re.search(r'\b' + tech + r'\b', jd_normalized) and tech not in [normalize_text(s) for s in matched_skills]:
            missing_skills.append(tech.title())
            
    # Calculate skill score (70%)
    skill_score_pct = 70.0
    if len(matched_skills) + len(missing_skills) > 0:
        skill_ratio = len(matched_skills) / (len(matched_skills) + len(missing_skills))
        skill_score_pct = 70.0 * skill_ratio
        
    # Find relevant projects & experience (20%)
    projects = project_repo.get_multi(db, limit=1000, filters={"is_active": True})
    experiences = experience_repo.get_multi(db, limit=1000, filters={"is_active": True})
    
    relevant_projects = []
    for p in projects:
        project_text = f"{p.title} {p.short_description or ''} {p.detailed_description or ''} {p.problem_solved or ''}".lower()
        if p.tech_stack:
            project_text += " " + json.dumps(p.tech_stack).lower()
        if p.features:
            project_text += " " + json.dumps(p.features).lower()
            
        matched_in_project = [s for s in matched_skills if normalize_text(s) in project_text]
        if matched_in_project:
            reason = f"Matches {', '.join(matched_in_project[:3])}"
            relevant_projects.append({"id": str(p.id), "title": p.title, "reason": reason})
            
    relevant_experiences = []
    for e in experiences:
        exp_text = f"{e.company_name} {e.role} {e.summary or ''}".lower()
        if e.achievements:
            exp_text += " " + json.dumps(e.achievements).lower()
        if e.tech_stack:
            exp_text += " " + json.dumps(e.tech_stack).lower()
            
        matched_in_exp = [s for s in matched_skills if normalize_text(s) in exp_text]
        if matched_in_exp:
            reason = f"Relevant {', '.join(matched_in_exp[:3])} experience"
            relevant_experiences.append({"id": str(e.id), "companyName": e.company_name, "role": e.role, "reason": reason})
            
    exp_score_pct = 20.0
    if not relevant_projects and not relevant_experiences:
        exp_score_pct = 5.0 # baseline
        
    # Certifications (10%)
    certs = certification_repo.get_multi(db, limit=1000, filters={"is_active": True})
    cert_score_pct = 10.0 if certs else 0.0
    
    total_score = skill_score_pct + exp_score_pct + cert_score_pct
    
    # Build Result
    match_score = round(total_score, 1)
    matched = matched_skills
    missing = missing_skills
    weak = []
    relevant_projects = relevant_projects[:3]
    relevant_experience = relevant_experiences[:3]
    summary = f"Score is {match_score}/100 based on {len(matched_skills)} matched skills."
    
    result = JDMatchResult(
        matchScore=match_score,
        matchedSkills=matched,
        missingSkills=missing,
        weakSkills=weak,
        relevantProjects=relevant_projects,
        relevantExperience=relevant_experience,
        summary=summary
    )
    
    # 4. Save Query and Result to DB
    jd_query_repo.create(db, obj_in={
        "hr_name": query.hr_name,
        "hr_email": query.hr_email,
        "company_name": query.company_name,
        "role_title": query.role_title,
        "jd_text": query.jd_text,
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "weak_skills": weak,
        "relevant_projects": relevant_projects,
        "relevant_experience": relevant_experience,
        "summary": summary,
        "result_json": result.model_dump(),
        "ip_address": ip_address,
        "user_agent": user_agent
    })
    
    return result
