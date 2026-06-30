from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional

# Placeholder secrets that must never be accepted in any environment.
WEAK_JWT_SECRETS = {
    "change-me",
    "change-me-in-production",
    "super-secret-key-change-in-production",
    "secret",
    "your_super_secret_key_here",
}
MIN_JWT_SECRET_LENGTH = 32


class Settings(BaseSettings):
    APP_NAME: str = "portfolio-api"
    APP_ENV: str = "local"
    APP_VERSION: str = "1.0.0"
    
    DATABASE_URL: str
    
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    ENABLE_DEFAULT_SEED: bool = True
    AUTO_SEED_ON_STARTUP: bool = False

    # Optional env-driven default admin. When both are set, the admin is auto-created
    # on startup (if not already present). Keeps secrets out of source control.
    DEFAULT_ADMIN_EMAIL: Optional[str] = None
    DEFAULT_ADMIN_PASSWORD: Optional[str] = None
    DEFAULT_ADMIN_NAME: str = "Admin"

    UPLOAD_DIR: str = "uploads/resume"
    MAX_RESUME_SIZE_MB: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if not value or value.strip().lower() in WEAK_JWT_SECRETS:
            raise ValueError(
                "JWT_SECRET_KEY is missing or set to an insecure placeholder. "
                "Set a strong, random secret of at least "
                f"{MIN_JWT_SECRET_LENGTH} characters."
            )
        if len(value) < MIN_JWT_SECRET_LENGTH:
            raise ValueError(
                f"JWT_SECRET_KEY must be at least {MIN_JWT_SECRET_LENGTH} characters long."
            )
        return value

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",")]

settings = Settings()
