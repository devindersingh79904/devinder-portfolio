from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str
    code: str

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    errors: List[ErrorDetail] = []
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    correlationId: str = ""

class PaginationData(BaseModel, Generic[T]):
    content: List[T]
    page: int
    size: int
    totalElements: int
    totalPages: int
    first: bool
    last: bool
