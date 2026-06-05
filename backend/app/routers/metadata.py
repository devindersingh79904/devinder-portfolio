from fastapi import APIRouter

from app.core.constants import API_V1_PREFIX, ENUMS_PATH, METADATA_PREFIX, MSG_ENUMS_FETCHED
from app.core.enums import AnalyticsEventType, CertificationStatus, SkillCategory, SkillProficiency
from app.schemas.common import APIResponse
from app.utils.response import success_response

router = APIRouter(prefix=f"{API_V1_PREFIX}{METADATA_PREFIX}")

@router.get(ENUMS_PATH, response_model=APIResponse)
def get_enums():
    data = {
        "skillCategories": [e.value for e in SkillCategory],
        "skillProficiencies": [e.value for e in SkillProficiency],
        "analyticsEventTypes": [e.value for e in AnalyticsEventType],
        "certificationStatuses": [e.value for e in CertificationStatus],
    }
    return success_response(data=data, message=MSG_ENUMS_FETCHED)
