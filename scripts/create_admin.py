import sys
import os

# Add backend directory to sys.path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.db.database import SessionLocal
from app.models.admin import AdminUser
from app.core.security import get_password_hash

def create_admin(username: str, password: str):
    db = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.username == username).first()
        if existing:
            print(f"Admin user '{username}' already exists.")
            return
            
        hashed_pw = get_password_hash(password)
        admin = AdminUser(username=username, password_hash=hashed_pw)
        db.add(admin)
        db.commit()
        print(f"Successfully created admin user: {username}")
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <username> <password>")
        sys.exit(1)
        
    username = sys.argv[1]
    password = sys.argv[2]
    create_admin(username, password)
