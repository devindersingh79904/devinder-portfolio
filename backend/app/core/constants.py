# API Route Prefixes
API_V1_PREFIX = "/api/v1"

# General Endpoints
ROOT_PATH = "/"
HEALTH_PATH = "/health"
CONTACT_PATH = "/contact"
JD_MATCH_PATH = "/jd-match"
PROFILE_PATH = "/profile"
PROFILE_RESUME_DOWNLOAD_PATH = "/profile/resume/download"
RESUME_DOWNLOAD_PATH = PROFILE_RESUME_DOWNLOAD_PATH
EVENTS_PATH = "/analytics/events"
ANALYTICS_EVENTS_PATH = EVENTS_PATH

PROJECTS_PATH = "/projects"
PROJECT_DETAIL_PATH = "/projects/{project_id}"

EXPERIENCE_PATH = "/experience"
EDUCATION_PATH = "/education"
CERTIFICATIONS_PATH = "/certifications"
SKILLS_PATH = "/skills"

# Metadata Endpoints
METADATA_PREFIX = "/metadata"
ENUMS_PATH = "/enums"

# Admin Endpoints
ADMIN_PREFIX = "/admin"
ADMIN_LOGIN_PATH = "/login"
AUTH_LOGIN_PATH = ADMIN_LOGIN_PATH
ADMIN_DASHBOARD_STATS_PATH = "/dashboard/stats"

ADMIN_PROFILE_PATH = "/profile"
ADMIN_PROFILE_RESUME_PATH = "/profile/resume"

ADMIN_PROJECTS_PATH = "/projects"
ADMIN_PROJECT_DETAIL_PATH = "/projects/{item_id}"
ADMIN_EXPERIENCE_PATH = "/experience"
ADMIN_EXPERIENCE_DETAIL_PATH = "/experience/{item_id}"
ADMIN_EDUCATION_PATH = "/education"
ADMIN_EDUCATION_DETAIL_PATH = "/education/{item_id}"
ADMIN_CERTIFICATIONS_PATH = "/certifications"
ADMIN_CERTIFICATION_DETAIL_PATH = "/certifications/{item_id}"
ADMIN_SKILLS_PATH = "/skills"
ADMIN_SKILL_DETAIL_PATH = "/skills/{item_id}"

ADMIN_JD_QUERIES_PATH = "/jd-queries"
ADMIN_JD_QUERY_DETAIL_PATH = "/jd-queries/{query_id}"
ADMIN_JD_QUERIES_EXPORT_PATH = "/jd-queries/export"

ADMIN_CONTACT_LEADS_PATH = "/contact-leads"
ADMIN_CONTACT_LEAD_DETAIL_PATH = "/contact-leads/{lead_id}"
ADMIN_CONTACT_LEADS_EXPORT_PATH = "/contact-leads/export"

# Headers
HEADER_CORRELATION_ID = "X-Correlation-ID"
CORRELATION_ID_HEADER = HEADER_CORRELATION_ID  # For backwards compatibility if used elsewhere

# API Messages
MSG_LOGIN_SUCCESS = "Login successful"
MSG_DASHBOARD_STATS_FETCHED = "Dashboard stats fetched successfully"
MSG_PORTFOLIO_API_RUNNING = "Portfolio API is running"
MSG_SERVICE_HEALTHY = "Service is healthy"
MSG_SERVICE_UNHEALTHY = "Service is unhealthy"
MSG_SUCCESS = "Success"
MSG_ENUMS_FETCHED = "Enums fetched successfully"
MSG_VALIDATION_FAILED = "Validation failed"
MSG_INTERNAL_ERROR = "An unexpected error occurred"
MSG_ITEM_NOT_FOUND = "Item not found"
MSG_ITEMS_FETCHED = "Items fetched successfully"
MSG_ITEM_CREATED = "Item created successfully"
MSG_ITEM_UPDATED = "Item updated successfully"
MSG_ITEM_DELETED = "Item deleted successfully"

# Error Codes
ERROR_DATABASE_DOWN = "DATABASE_DOWN"
ERROR_UNAUTHORIZED = "UNAUTHORIZED"
ERROR_VALIDATION_FAILED = "VALIDATION_FAILED"
ERROR_NOT_FOUND = "NOT_FOUND"
ERROR_INTERNAL = "INTERNAL_SERVER_ERROR"
ERROR_DUPLICATE = "DUPLICATE_RECORD"

class ErrorCodes:
    VALIDATION_ERROR = ERROR_VALIDATION_FAILED
    AUTH_ERROR = ERROR_UNAUTHORIZED
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    NOT_FOUND = ERROR_NOT_FOUND
    DUPLICATE_RECORD = ERROR_DUPLICATE
    DATABASE_ERROR = ERROR_DATABASE_DOWN
    INTERNAL_SERVER_ERROR = ERROR_INTERNAL

class Messages:
    SUCCESS = MSG_SUCCESS
    VALIDATION_FAILED = MSG_VALIDATION_FAILED
    INTERNAL_ERROR = MSG_INTERNAL_ERROR

# Analytics Events
EVENT_CONTACT_FORM_SUBMITTED = "CONTACT_FORM_SUBMITTED"
EVENT_JD_MATCH_SUBMITTED = "JD_MATCH_SUBMITTED"
EVENT_RESUME_DOWNLOAD = "RESUME_DOWNLOAD"
EVENT_PAGE_VIEW = "PAGE_VIEW"

# Pagination Defaults
DEFAULT_PAGE = 0
DEFAULT_SIZE = 10
MAX_PAGE_SIZE = 100

# File Paths and Names
RESUME_UPLOAD_DIR = "uploads/resume"
LATEST_RESUME_FILENAME = "latest-resume.pdf"
CSV_JD_QUERIES_FILENAME = "jd-queries.csv"
CSV_CONTACT_LEADS_FILENAME = "contact-leads.csv"

# Log Message Templates
LOG_INCOMING_REQUEST = (
    "Incoming request method={method} path={path} query={query} "
    "clientIp={client_ip} userAgent={user_agent} correlationId={corr_id}"
)

LOG_OUTGOING_RESPONSE = (
    "Outgoing response method={method} path={path} "
    "status={status} durationMs={duration_ms} correlationId={corr_id}"
)

LOG_HEALTH_CHECK_FAILED = "Health check failed"
