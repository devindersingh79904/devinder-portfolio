import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.constants import (
    ROOT_PATH,
    HEALTH_PATH,
    LOG_INCOMING_REQUEST,
    LOG_OUTGOING_RESPONSE,
    HEADER_CORRELATION_ID,
    MSG_PORTFOLIO_API_RUNNING,
    MSG_SERVICE_HEALTHY,
    MSG_SERVICE_UNHEALTHY,
    LOG_HEALTH_CHECK_FAILED,
    ERROR_DATABASE_DOWN,
)
from app.core.correlation import CorrelationIdMiddleware, get_correlation_id
from app.core.exceptions import (
    PortfolioException,
    global_exception_handler,
    http_exception_handler,
    portfolio_exception_handler,
    sqlalchemy_exception_handler,
    starlette_http_exception_handler,
    validation_exception_handler,
)
from app.core.logging_config import setup_logging
from app.core.rate_limit import setup_rate_limiting
from app.routers import admin, metadata, public
from app.routers.deps import get_db
from app.schemas.common import APIResponse

# Initialize logging
logger = setup_logging()

# Query params that must never be written to logs in cleartext.
SENSITIVE_QUERY_KEYS = {"password", "token", "access_token", "secret", "api_key", "apikey", "authorization"}


def _redact_query(params) -> str:
    return "&".join(
        f"{k}=***" if k.lower() in SENSITIVE_QUERY_KEYS else f"{k}={v}"
        for k, v in params.items()
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Optional auto-seed on startup. Idempotent and also gated by ENABLE_DEFAULT_SEED.
    if settings.AUTO_SEED_ON_STARTUP:
        try:
            from scripts.seed_portfolio import seed_portfolio
            seed_portfolio()
        except Exception:
            logger.exception("Auto-seed on startup failed")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# Middleware
app.add_middleware(CorrelationIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[HEADER_CORRELATION_ID]
)

# Global Exception Handlers
app.add_exception_handler(PortfolioException, portfolio_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Rate limiting
setup_rate_limiting(app)

# Include Routers
app.include_router(public.router)
app.include_router(admin.router)
app.include_router(metadata.router)

@app.middleware("http")
async def process_time_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    corr_id = get_correlation_id()
    
    query = _redact_query(request.query_params)

    logger.info(LOG_INCOMING_REQUEST.format(
        method=request.method, 
        path=request.url.path, 
        query=query,
        client_ip=client_ip, 
        user_agent=user_agent,
        corr_id=corr_id
    ))
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    duration_ms = int(process_time * 1000)
    
    logger.info(LOG_OUTGOING_RESPONSE.format(
        method=request.method, 
        path=request.url.path, 
        status=response.status_code, 
        duration_ms=duration_ms, 
        corr_id=corr_id
    ))
    return response

@app.get(ROOT_PATH, response_model=APIResponse)
async def root():
    return APIResponse(
        success=True,
        message=MSG_PORTFOLIO_API_RUNNING,
        data={
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION
        },
        correlationId=get_correlation_id()
    )

@app.get(HEALTH_PATH, response_model=APIResponse)
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return APIResponse(
            success=True,
            message=MSG_SERVICE_HEALTHY,
            data={
                "status": "UP",
                "database": "UP"
            },
            correlationId=get_correlation_id()
        )
    except Exception:
        logger.exception(LOG_HEALTH_CHECK_FAILED)
        response = APIResponse(
            success=False,
            message=MSG_SERVICE_UNHEALTHY,
            data={
                "status": "DOWN",
                "database": "DOWN"
            },
            errors=[
                {
                    "field": "database",
                    "message": "Database connectivity check failed",
                    "code": ERROR_DATABASE_DOWN
                }
            ],
            correlationId=get_correlation_id()
        )
        return JSONResponse(status_code=503, content=response.model_dump())
