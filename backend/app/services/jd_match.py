import json
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.schemas.portfolio import JDQueryCreate, JDMatchResult
from app.repositories.portfolio import skill_repo, project_repo, experience_repo, certification_repo
from app.repositories.queries import jd_query_repo

def normalize_text(text: str) -> str:
    return text.lower().strip()

def calculate_jd_match(db: Session, query: JDQueryCreate) -> JDMatchResult:
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
        # Check if project description contains any matched skill
        if any(normalize_text(s) in normalize_text(p.description) for s in matched_skills):
            relevant_projects.append({"id": str(p.id), "title": p.title})
            
    relevant_experiences = []
    for e in experiences:
        if any(normalize_text(s) in normalize_text(e.description) for s in matched_skills):
            relevant_experiences.append({"id": str(e.id), "company": e.company, "role": e.role})
            
    exp_score_pct = 20.0
    if not relevant_projects and not relevant_experiences:
        exp_score_pct = 5.0 # baseline
        
    # Certifications (10%)
    certs = certification_repo.get_multi(db, limit=1000, filters={"is_active": True})
    cert_score_pct = 10.0 if certs else 0.0
    
    total_score = skill_score_pct + exp_score_pct + cert_score_pct
    
    # Build Result
    result = JDMatchResult(
        matchScore=round(total_score, 1),
        matchedSkills=matched_skills,
        missingSkills=missing_skills,
        weakSkills=[], # Hard to determine without more complex AI, leaving empty for MVP
        relevantProjects=relevant_projects[:3], # Top 3
        relevantExperience=relevant_experiences[:3], # Top 3
        summary=f"Score is {round(total_score, 1)}/100 based on {len(matched_skills)} matched skills."
    )
    
    # Save Query
    jd_query_repo.create(db, obj_in={
        "query_text": query.jd_text,
        "match_score": result.matchScore,
        "result_json": result.model_dump()
    })
    
    return result
