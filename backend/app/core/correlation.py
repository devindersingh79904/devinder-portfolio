import uuid
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.core.constants import CORRELATION_ID_HEADER

correlation_id_ctx_var: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(CORRELATION_ID_HEADER, str(uuid.uuid4()))
        correlation_id_ctx_var.set(correlation_id)
        
        response = await call_next(request)
        response.headers[CORRELATION_ID_HEADER] = correlation_id
        return response

def get_correlation_id() -> str:
    return correlation_id_ctx_var.get()
