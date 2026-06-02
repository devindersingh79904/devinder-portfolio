from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from app.core.exceptions import build_error_response

limiter = Limiter(key_func=get_remote_address)

async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    errors = [{"message": "Rate limit exceeded. Please try again later.", "code": "RATE_LIMIT_EXCEEDED"}]
    return build_error_response("Rate limit exceeded", errors, 429)

def setup_rate_limiting(app: FastAPI):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)
