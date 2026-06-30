from datetime import datetime, timedelta, timezone
from typing import Optional, Union
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings
from app.core.exceptions import PortfolioException, ErrorCodes

def _password_bytes(password: str) -> bytes:
    # bcrypt only uses the first 72 bytes and raises on longer inputs (bcrypt>=4.1),
    # so truncate defensively to keep hashing/verification consistent.
    return password.encode("utf-8")[:72]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_password_bytes(plain_password), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")

def validate_password_warnings(password: str) -> list:
    """Warn-only password policy: return human-readable warnings, never block."""
    warnings = []
    if len(password) < settings.MIN_ADMIN_PASSWORD_LENGTH:
        warnings.append(f"shorter than the recommended {settings.MIN_ADMIN_PASSWORD_LENGTH} characters")
    return warnings

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise PortfolioException("Invalid or expired token", ErrorCodes.AUTH_ERROR, 401)
