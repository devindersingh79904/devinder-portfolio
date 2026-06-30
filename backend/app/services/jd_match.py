import json
import logging
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.schemas.portfolio import JDQueryCreate, JDMatchResult
from app.repositories.portfolio import skill_repo, project_repo, experience_repo, certification_repo
from app.repositories.queries import jd_query_repo
from app.repositories.settings import resolve_jd_config

logger = logging.getLogger(__name__)

def normalize_text(text: str) -> str:
    return text.lower().strip()


# Proficiency labels considered "strong" enough to count as a full match.
STRONG_PROFICIENCIES = {"advanced", "expert"}


def is_strong_proficiency(value) -> bool:
    """Return True for strong proficiency. Supports both string labels
    (Beginner/Intermediate/Advanced/Expert) and legacy numeric values."""
    if value is None:
        return True  # unknown proficiency: assume competent rather than penalize
    if isinstance(value, (int, float)):
        return value >= 60
    return str(value).strip().lower() in STRONG_PROFICIENCIES

def _match_via_heuristic(db: Session, query: JDQueryCreate) -> JDMatchResult:
    # 1. Fetch all skills from DB
    all_skills = skill_repo.get_multi(db, limit=1000, filters={"is_active": True})
    known_skills = {normalize_text(s.name): s for s in all_skills}
    
    # 2. Extract matched skills by simple text search
    jd_normalized = normalize_text(query.jd_text)
    
    matched_skills = []   # required skills we have at a strong proficiency
    weak_skills = []      # required skills we have, but only at a lower proficiency
    found_skills = []     # all of our skills mentioned in the JD (strong + weak)

    # Keyword-match our known skills against the JD, classifying by proficiency.
    for skill_name_norm, skill_obj in known_skills.items():
        if re.search(r'\b' + re.escape(skill_name_norm) + r'\b', jd_normalized):
            found_skills.append(skill_obj.name)
            if is_strong_proficiency(skill_obj.proficiency):
                matched_skills.append(skill_obj.name)
            else:
                weak_skills.append(skill_obj.name)

    # Missing skills: well-known techs referenced in the JD that we don't have at all.
    found_norm = [normalize_text(s) for s in found_skills]
    missing_skills = []
    common_tech_dict = ["kubernetes", "graphql", "redis", "docker", "aws", "gcp", "azure", "react", "python", "java", "node.js"]
    for tech in common_tech_dict:
        if re.search(r'\b' + tech + r'\b', jd_normalized):
            already_have = any(tech in fs or fs in tech for fs in found_norm)
            if not already_have:
                missing_skills.append(tech.title())

    # Calculate skill score (70%): strong matches full weight, weak matches half.
    total_skill_signals = len(matched_skills) + len(weak_skills) + len(missing_skills)
    if total_skill_signals > 0:
        weighted = len(matched_skills) + 0.5 * len(weak_skills)
        skill_score_pct = 70.0 * (weighted / total_skill_signals)
    else:
        skill_score_pct = 70.0
        
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
            
        matched_in_project = [s for s in found_skills if normalize_text(s) in project_text]
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
            
        matched_in_exp = [s for s in found_skills if normalize_text(s) in exp_text]
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
    weak = weak_skills
    relevant_projects = relevant_projects[:3]
    relevant_experience = relevant_experiences[:3]
    summary = f"Score is {match_score}/100 based on {len(matched_skills)} matched skills."
    
    return JDMatchResult(
        matchScore=match_score,
        matchedSkills=matched,
        missingSkills=missing,
        weakSkills=weak,
        relevantProjects=relevant_projects,
        relevantExperience=relevant_experience,
        summary=summary
    )


def calculate_jd_match(db: Session, query: JDQueryCreate, ip_address: str = None, user_agent: str = None) -> JDMatchResult:
    """Orchestrator: use the Claude LLM when configured (env OR admin Settings),
    otherwise fall back to the offline keyword heuristic. Persists the query once."""
    llm_enabled, model, api_key = resolve_jd_config(db)

    result = None
    if llm_enabled and api_key:
        try:
            from app.services.llm_jd_match import calculate_jd_match_llm
            result = calculate_jd_match_llm(db, query, model=model, api_key=api_key)
        except Exception as e:
            # Expected when the key/model is misconfigured — fall back, don't error out.
            logger.warning("LLM JD match failed (%s); falling back to heuristic", type(e).__name__)

    if result is None:
        result = _match_via_heuristic(db, query)

    # Persist the query + result once, regardless of which strategy produced it.
    jd_query_repo.create(db, obj_in={
        "hr_name": query.hr_name,
        "hr_email": query.hr_email,
        "company_name": query.company_name,
        "role_title": query.role_title,
        "jd_text": query.jd_text,
        "match_score": result.matchScore,
        "matched_skills": result.matchedSkills,
        "missing_skills": result.missingSkills,
        "weak_skills": result.weakSkills,
        "relevant_projects": result.relevantProjects,
        "relevant_experience": result.relevantExperience,
        "summary": result.summary,
        "result_json": result.model_dump(),
        "ip_address": ip_address,
        "user_agent": user_agent
    })

    return result
