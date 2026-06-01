from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import PortfolioException, ErrorCodes
from app.models.admin import AdminUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/admin/login")

def get_current_admin(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> AdminUser:
    payload = decode_access_token(token)
    username = payload.get("sub")
    if username is None:
        raise PortfolioException("Invalid authentication credentials", ErrorCodes.AUTH_ERROR, 401)
        
    admin = db.query(AdminUser).filter(AdminUser.username == username, AdminUser.is_active == True).first()
    if admin is None:
        raise PortfolioException("Admin user not found or inactive", ErrorCodes.AUTH_ERROR, 401)
        
    return admin
