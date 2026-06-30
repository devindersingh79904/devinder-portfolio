import sys
import os

# Add the backend root to sys.path to allow imports when running directly.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.models.admin import AdminUser
from app.core.security import get_password_hash, validate_password_warnings
from app.core.config import settings


def create_admin(email: str, password: str, name: str):
    db = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.email == email).first()
        if existing:
            print(f"Admin user '{email}' already exists.")
            return

        # Warn-only password policy (does not block weak passwords).
        for warning in validate_password_warnings(password):
            print(f"Warning: admin password is {warning}.")

        hashed_pw = get_password_hash(password)
        admin = AdminUser(email=email, password_hash=hashed_pw, name=name)
        db.add(admin)
        db.commit()
        print(f"Successfully created admin user: {email}")
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()


def seed_admin_from_env():
    """Create the default admin from DEFAULT_ADMIN_EMAIL/PASSWORD env vars if configured.

    Idempotent: skips silently when the vars are unset or the admin already exists.
    """
    email = settings.DEFAULT_ADMIN_EMAIL
    password = settings.DEFAULT_ADMIN_PASSWORD
    if not email or not password:
        return
    create_admin(email, password, settings.DEFAULT_ADMIN_NAME)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/create_admin.py <email> <password> [name]")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else "Admin"
    create_admin(email, password, name)
