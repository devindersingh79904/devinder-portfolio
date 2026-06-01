from app.repositories.base import BaseRepository
from app.models.portfolio import Project, Experience, Education, Certification, Skill
from app.schemas.portfolio import (
    ProjectCreate, ProjectUpdate,
    ExperienceCreate, ExperienceUpdate,
    EducationCreate, EducationUpdate,
    CertificationCreate, CertificationUpdate,
    SkillCreate, SkillUpdate
)

class ProjectRepository(BaseRepository[Project, ProjectCreate, ProjectUpdate]):
    pass

class ExperienceRepository(BaseRepository[Experience, ExperienceCreate, ExperienceUpdate]):
    pass

class EducationRepository(BaseRepository[Education, EducationCreate, EducationUpdate]):
    pass

class CertificationRepository(BaseRepository[Certification, CertificationCreate, CertificationUpdate]):
    pass

class SkillRepository(BaseRepository[Skill, SkillCreate, SkillUpdate]):
    pass

project_repo = ProjectRepository(Project)
experience_repo = ExperienceRepository(Experience)
education_repo = EducationRepository(Education)
certification_repo = CertificationRepository(Certification)
skill_repo = SkillRepository(Skill)
