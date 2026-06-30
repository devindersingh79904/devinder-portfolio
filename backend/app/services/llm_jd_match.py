"""LLM-powered JD matching via Claude, with a strict structured-output schema.

Returns a JDMatchResult or raises on any failure so the caller can fall back to
the offline heuristic. Credentials/model are resolved by the caller (env OR the
admin Settings override) and passed in.
"""
import logging
from typing import List

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.repositories.portfolio import (
    certification_repo,
    experience_repo,
    project_repo,
    skill_repo,
)
from app.schemas.portfolio import JDMatchResult, JDQueryCreate

logger = logging.getLogger(__name__)

# Structured-output schema the model must fill. Kept flat (no Dict[str, Any]) so
# it satisfies the structured-outputs constraints (additionalProperties: false).
class _LLMProject(BaseModel):
    id: str = ""
    title: str
    reason: str = ""

class _LLMExperience(BaseModel):
    id: str = ""
    companyName: str
    role: str
    reason: str = ""

class _LLMJDResult(BaseModel):
    matchScore: float
    matchedSkills: List[str]
    missingSkills: List[str]
    weakSkills: List[str]
    relevantProjects: List[_LLMProject]
    relevantExperience: List[_LLMExperience]
    summary: str

def _build_candidate_context(db: Session) -> str:
    skills = skill_repo.get_multi(db, limit=1000, filters={"is_active": True})
    projects = project_repo.get_multi(db, limit=1000, filters={"is_active": True})
    experiences = experience_repo.get_multi(db, limit=1000, filters={"is_active": True})
    certs = certification_repo.get_multi(db, limit=1000, filters={"is_active": True})

    skill_lines = [f"- {s.name} ({s.category}, {s.proficiency or 'n/a'})" for s in skills]
    project_lines = [
        f"- [{p.id}] {p.title}: {p.short_description or ''} | tech: {', '.join(p.tech_stack or [])}"
        for p in projects
    ]
    exp_lines = [
        f"- [{e.id}] {e.role} @ {e.company_name}: {e.summary or ''} | tech: {', '.join(e.tech_stack or [])}"
        for e in experiences
    ]
    cert_lines = [f"- {c.title} ({c.issuer})" for c in certs]

    return (
        "SKILLS:\n" + "\n".join(skill_lines) +
        "\n\nPROJECTS:\n" + "\n".join(project_lines) +
        "\n\nEXPERIENCE:\n" + "\n".join(exp_lines) +
        "\n\nCERTIFICATIONS:\n" + "\n".join(cert_lines)
    )

def calculate_jd_match_llm(db: Session, query: JDQueryCreate, model: str, api_key: str) -> JDMatchResult:
    """Score the JD against the candidate using Claude. Raises on any error."""
    import anthropic  # imported lazily so the dependency is optional at runtime

    context = _build_candidate_context(db)
    system = (
        "You are an expert technical recruiter. Compare a candidate's profile to a job "
        "description and produce an honest, calibrated match assessment. matchScore is 0-100. "
        "matchedSkills are required skills the candidate clearly has; weakSkills are ones they "
        "have but at a lower level; missingSkills are required skills absent from the profile. "
        "relevantProjects/relevantExperience must reference the candidate's real items by their "
        "bracketed id, with a one-line reason. Be concise and specific in the summary."
    )
    user = (
        f"CANDIDATE PROFILE:\n{context}\n\n"
        f"JOB DESCRIPTION (role: {query.role_title or 'n/a'}):\n{query.jd_text}"
    )

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.parse(
        model=model,
        max_tokens=2000,
        system=system,
        messages=[{"role": "user", "content": user}],
        output_format=_LLMJDResult,
    )
    parsed: _LLMJDResult = response.parsed_output

    return JDMatchResult(
        matchScore=round(float(parsed.matchScore), 1),
        matchedSkills=parsed.matchedSkills,
        missingSkills=parsed.missingSkills,
        weakSkills=parsed.weakSkills,
        relevantProjects=[p.model_dump() for p in parsed.relevantProjects[:3]],
        relevantExperience=[e.model_dump() for e in parsed.relevantExperience[:3]],
        summary=parsed.summary,
    )
