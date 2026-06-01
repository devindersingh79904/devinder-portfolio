from typing import Any
from app.schemas.common import APIResponse
from app.core.correlation import get_correlation_id

def success_response(data: Any = None, message: str = "Success") -> APIResponse:
    return APIResponse(
        success=True,
        message=message,
        data=data,
        correlationId=get_correlation_id()
    )
