from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from app.core.constants import ErrorCodes, Messages
from app.core.correlation import get_correlation_id
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class PortfolioException(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400, details: list = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []

def build_error_response(message: str, errors: list, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": None,
            "errors": errors,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "correlationId": get_correlation_id()
        }
    )

async def portfolio_exception_handler(request: Request, exc: PortfolioException):
    errors = [{"message": exc.message, "code": exc.code}]
    if exc.details:
        errors = exc.details
    return build_error_response(exc.message, errors, exc.status_code)

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        {
            "field": ".".join(str(loc) for loc in err["loc"]),
            "message": err["msg"],
            "code": ErrorCodes.VALIDATION_ERROR
        }
        for err in exc.errors()
    ]
    return build_error_response(Messages.VALIDATION_FAILED, errors, 422)

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error")
    errors = [{"message": "Database operation failed", "code": ErrorCodes.DATABASE_ERROR}]
    return build_error_response("Database Error", errors, 500)

async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unexpected error")
    errors = [{"message": Messages.INTERNAL_ERROR, "code": ErrorCodes.INTERNAL_SERVER_ERROR}]
    return build_error_response(Messages.INTERNAL_ERROR, errors, 500)

async def http_exception_handler(request: Request, exc: HTTPException):
    errors = [{"message": str(exc.detail), "code": ErrorCodes.VALIDATION_ERROR}]
    return build_error_response(str(exc.detail), errors, exc.status_code)

async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    errors = [{"message": str(exc.detail), "code": "HTTP_ERROR"}]
    return build_error_response(str(exc.detail), errors, exc.status_code)
