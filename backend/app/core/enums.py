from enum import Enum


class SkillCategory(str, Enum):
    PROGRAMMING_LANGUAGE = "Programming Language"
    BACKEND = "Backend"
    FRONTEND = "Frontend"
    DATABASE = "Database"
    CLOUD = "Cloud"
    DEVOPS = "DevOps"
    AI = "AI"
    TOOLS = "Tools"
    OTHER = "Other"


class SkillProficiency(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    EXPERT = "Expert"


class AnalyticsEventType(str, Enum):
    PAGE_VIEW = "PAGE_VIEW"
    RESUME_DOWNLOAD = "RESUME_DOWNLOAD"
    JD_MATCH_SUBMITTED = "JD_MATCH_SUBMITTED"
    CONTACT_FORM_SUBMITTED = "CONTACT_FORM_SUBMITTED"
    PROJECT_CLICKED = "PROJECT_CLICKED"


class CertificationStatus(str, Enum):
    ACTIVE = "Active"
    EXPIRED = "Expired"
    NO_EXPIRY = "No Expiry"
