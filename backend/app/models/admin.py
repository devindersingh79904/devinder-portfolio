from sqlalchemy import Column, String, Boolean
from app.db.base import BaseModel

class AdminUser(BaseModel):
    __tablename__ = "admin_users"

    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
