from typing import TypeVar, List
from app.schemas.common import PaginationData

T = TypeVar("T")

def build_pagination(content: List[T], page: int, size: int, total_elements: int) -> PaginationData[T]:
    total_pages = (total_elements + size - 1) // size if size > 0 else 1
    return PaginationData(
        content=content,
        page=page,
        size=size,
        totalElements=total_elements,
        totalPages=total_pages,
        first=page == 0,
        last=page >= total_pages - 1
    )
