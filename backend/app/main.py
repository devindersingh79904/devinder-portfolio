from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import time

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.correlation import CorrelationIdMiddleware, get_correlation_id
from app.core.exceptions import (
    PortfolioException,
    portfolio_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    global_exception_handler
)
from app.schemas.common import APIResponse
from app.routers import public, admin
from app.core.rate_limit import setup_rate_limiting
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.routers.deps import get_db
from fastapi.responses import JSONResponse

# Initialize logging
logger = setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Middleware
app.add_middleware(CorrelationIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID"]
)

# Global Exception Handlers
app.add_exception_handler(PortfolioException, portfolio_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Rate limiting
setup_rate_limiting(app)

# Include Routers
app.include_router(public.router)
app.include_router(admin.router)

@app.middleware("http")
async def process_time_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    # Ensure correlationId is added to all JSON responses if not present
    # Usually handled at router level but we can inject here if needed.
    process_time = time.time() - start_time
    logger.info(f"Request: {request.method} {request.url.path} completed in {process_time:.4f}s")
    return response

@app.get("/", response_model=APIResponse)
async def root():
    return APIResponse(
        success=True,
        message="Portfolio API is running",
        data={
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION
        },
        correlationId=get_correlation_id()
    )

@app.get("/health", response_model=APIResponse)
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return APIResponse(
            success=True,
            message="Service is healthy",
            data={
                "status": "UP",
                "database": "UP"
            },
            correlationId=get_correlation_id()
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        response = APIResponse(
            success=False,
            message="Service is unhealthy",
            data={
                "status": "DOWN",
                "database": "DOWN"
            },
            errors=[
                {
                    "field": "database",
                    "message": "Database connectivity check failed",
                    "code": "DATABASE_DOWN"
                }
            ],
            correlationId=get_correlation_id()
        )
        return JSONResponse(status_code=503, content=response.model_dump())
